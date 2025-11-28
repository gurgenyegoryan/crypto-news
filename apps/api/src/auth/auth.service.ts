import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async getUserById(id: string): Promise<any> {
        return this.usersService.findById(id);
    }

    async login(user: any, twoFactorCode?: string) {
        // Check if 2FA is enabled
        if (user.isTwoFactorEnabled && !twoFactorCode) {
            return {
                requiresTwoFactor: true,
                userId: user.id,
                email: user.email,
            };
        }

        // Verify 2FA code if enabled
        if (user.isTwoFactorEnabled && twoFactorCode) {
            const isValid = await this.verify2FACode(user.id, twoFactorCode);
            if (!isValid) {
                throw new UnauthorizedException('Invalid 2FA code');
            }
        }

        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
            }
        };
    }

    async signup(email: string, pass: string, name?: string) {
        const existingUser = await this.usersService.findOne(email);
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(pass, 10);
        const verificationToken = randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await this.usersService.create({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiry,
            isVerified: false,
        } as any);

        await this.emailService.sendVerificationEmail(email, verificationToken);

        return this.login(user);
    }

    async verifyEmail(token: string) {
        const user = await this.usersService.findByVerificationToken(token);
        if (!user) {
            throw new BadRequestException('Invalid verification token');
        }

        if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
            throw new BadRequestException('Verification token expired');
        }

        if (user.isVerified) {
            return { message: 'Email already verified' };
        }

        await this.usersService.update(user.id, {
            isVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null,
        });

        return { message: 'Email verified successfully' };
    }

    async resendVerification(user: any) {
        if (user.isVerified) {
            throw new BadRequestException('Email already verified');
        }

        const verificationToken = randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await this.usersService.update(user.id, {
            verificationToken,
            verificationTokenExpiry,
        });

        await this.emailService.sendVerificationEmail(user.email, verificationToken);

        return { message: 'Verification email sent' };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verify current password
        if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await this.usersService.update(userId, {
            password: hashedPassword,
        });

        return { message: 'Password changed successfully' };
    }

    // === 2FA Methods ===

    async generate2FASecret(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 'CryptoMonitor', secret);

        // Save secret temporarily (or permanently but inactive)
        await this.usersService.update(userId, {
            twoFactorSecret: secret,
        });

        const qrCodeUrl = await toDataURL(otpauthUrl);

        return {
            secret,
            qrCodeUrl,
        };
    }

    async enable2FA(userId: string, code: string) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.twoFactorSecret) {
            throw new BadRequestException('2FA setup not initiated');
        }

        const isValid = authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });

        if (!isValid) {
            throw new BadRequestException('Invalid 2FA code');
        }

        await this.usersService.update(userId, {
            isTwoFactorEnabled: true,
        });

        return { message: '2FA enabled successfully' };
    }

    async disable2FA(userId: string, code: string) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (!user.isTwoFactorEnabled) {
            throw new BadRequestException('2FA is not enabled');
        }

        if (!user.twoFactorSecret) {
            throw new BadRequestException('2FA secret not found');
        }

        // Verify code before disabling
        const isValid = authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });

        if (!isValid) {
            throw new BadRequestException('Invalid 2FA code');
        }

        await this.usersService.update(userId, {
            isTwoFactorEnabled: false,
            twoFactorSecret: null,
        });

        return { message: '2FA disabled successfully' };
    }

    async verify2FACode(userId: string, code: string): Promise<boolean> {
        const user = await this.usersService.findById(userId);
        if (!user || !user.twoFactorSecret) return false;

        return authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });
    }

    async updateProfile(userId: string, name: string, email: string) {
        // Check if email is already taken by another user
        if (email) {
            const existingUser = await this.usersService.findOne(email);

            if (existingUser && existingUser.id !== userId) {
                throw new Error('Email is already in use');
            }
        }

        const user = await this.usersService.update(userId, {
            name,
            email,
        });

        const { password, verificationToken, verificationTokenExpiry, twoFactorSecret, ...result } = user;
        return result;
    }
}
