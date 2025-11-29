import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailService;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService);
    validateUser(email: string, pass: string): Promise<any>;
    getUserById(id: string): Promise<any>;
    login(user: any, twoFactorCode?: string): Promise<{
        requiresTwoFactor: boolean;
        userId: any;
        email: any;
        access_token?: undefined;
        user?: undefined;
    } | {
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            isVerified: any;
            isTwoFactorEnabled: any;
        };
        requiresTwoFactor?: undefined;
        userId?: undefined;
        email?: undefined;
    }>;
    signup(email: string, pass: string, name?: string): Promise<{
        requiresTwoFactor: boolean;
        userId: any;
        email: any;
        access_token?: undefined;
        user?: undefined;
    } | {
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            isVerified: any;
            isTwoFactorEnabled: any;
        };
        requiresTwoFactor?: undefined;
        userId?: undefined;
        email?: undefined;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerification(user: any): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    generate2FASecret(userId: string): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    enable2FA(userId: string, code: string): Promise<{
        message: string;
    }>;
    disable2FA(userId: string, code: string): Promise<{
        message: string;
    }>;
    verify2FACode(userId: string, code: string): Promise<boolean>;
    updateProfile(userId: string, name: string, email: string): Promise<{
        email: string;
        name: string | null;
        id: string;
        telegramId: string | null;
        createdAt: Date;
        tier: string;
        isVerified: boolean;
        emailAlerts: boolean;
        isTwoFactorEnabled: boolean;
        premiumUntil: Date | null;
        lastPaymentDate: Date | null;
        subscriptionStatus: string;
    }>;
}
