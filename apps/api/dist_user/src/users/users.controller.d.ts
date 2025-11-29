import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        email: string;
        name: string | null;
        id: string;
        telegramId: string | null;
        createdAt: Date;
        tier: string;
        isVerified: boolean;
        emailAlerts: boolean;
        twoFactorSecret: string | null;
        isTwoFactorEnabled: boolean;
        premiumUntil: Date | null;
        lastPaymentDate: Date | null;
        subscriptionStatus: string;
    }>;
    updateProfile(req: any, body: {
        name?: string;
        email?: string;
        telegramId?: string | null;
        emailAlerts?: boolean;
    }): Promise<{
        email: string;
        name: string | null;
        id: string;
        telegramId: string | null;
        createdAt: Date;
        tier: string;
        isVerified: boolean;
        emailAlerts: boolean;
        twoFactorSecret: string | null;
        isTwoFactorEnabled: boolean;
        premiumUntil: Date | null;
        lastPaymentDate: Date | null;
        subscriptionStatus: string;
    }>;
}
