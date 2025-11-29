import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    verifyPayment(req: any, body: VerifyPaymentDto): Promise<{
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
    getSubscriptionStatus(req: any): Promise<{
        daysRemaining: number;
        isActive: boolean;
        needsRenewal: boolean;
        tier: string;
        premiumUntil: Date | null;
        lastPaymentDate: Date | null;
        subscriptionStatus: string;
    } | null>;
    getPaymentHistory(req: any): Promise<{
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
}
