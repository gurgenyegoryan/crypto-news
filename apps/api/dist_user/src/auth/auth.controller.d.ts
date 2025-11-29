import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
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
    signup(req: any): Promise<{
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
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, body: {
        name: string;
        email: string;
    }): Promise<{
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
    verify(body: {
        token: string;
    }): Promise<{
        message: string;
    }>;
    resendVerification(req: any): Promise<{
        message: string;
    }>;
    changePassword(req: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    generate2FA(req: any): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    enable2FA(req: any, body: {
        code: string;
    }): Promise<{
        message: string;
    }>;
    disable2FA(req: any, body: {
        code: string;
    }): Promise<{
        message: string;
    }>;
}
