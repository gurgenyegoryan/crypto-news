import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    private readonly logger;
    private readonly ADMIN_WALLET_TRC20;
    private readonly MONTHLY_PRICE_USD;
    constructor(prisma: PrismaService);
    verifyPayment(userId: string, txHash: string): Promise<{
        success: boolean;
        message: string;
        tier?: undefined;
        premiumUntil?: undefined;
    } | {
        success: boolean;
        message: string;
        tier: string;
        premiumUntil: string;
    }>;
    checkExpiredSubscriptions(): Promise<number>;
    getPaymentHistory(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        txHash: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        network: string;
        status: string;
        subscriptionMonths: number;
        verifiedAt: Date | null;
    }[]>;
    getSubscriptionStatus(userId: string): Promise<{
        daysRemaining: number;
        isActive: boolean;
        needsRenewal: boolean;
        tier: string;
        premiumUntil: Date | null;
        lastPaymentDate: Date | null;
        subscriptionStatus: string;
    } | null>;
}
