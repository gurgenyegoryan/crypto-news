import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';

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

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified,
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
}
