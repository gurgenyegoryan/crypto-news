import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly ADMIN_WALLET_TRC20 = process.env.ADMIN_USDT_WALLET || 'TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29';
    private readonly ADMIN_WALLET_POLYGON = '0x9c4c8f7c057f459c62add15c7330f2a3060479a4';
    private readonly MONTHLY_PRICE_USD = 1;

    constructor(private prisma: PrismaService) { }

    async verifyPayment(userId: string, txHash: string, network: string = 'TRC20') {
        try {
            // Check if this transaction hash was already used
            const existingPayment = await this.prisma.payment.findUnique({
                where: { txHash }
            });

            if (existingPayment) {
                return {
                    success: false,
                    message: 'This transaction has already been used for a payment.'
                };
            }

            // In a real app, we would verify the transaction on-chain:
            // 1. Connect to Tron node (TronWeb)
            // 2. Get transaction details
            // 3. Verify it's a USDT TRC20 transfer
            // 4. Verify recipient is our wallet
            // 5. Verify amount is exactly 29 USDT
            // 6. Verify transaction is confirmed

            // For MVP, we simulate this with basic validation
            if (!txHash || txHash.length < 20) {
                return {
                    success: false,
                    message: 'Invalid transaction hash format.'
                };
            }

            this.logger.log(`Processing payment for user ${userId} with hash ${txHash}`);

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Get current user to check if they have an existing subscription
            const currentUser = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { premiumUntil: true, tier: true }
            });

            // Calculate subscription end date
            let premiumUntil: Date;

            if (currentUser?.tier === 'premium' && currentUser.premiumUntil && currentUser.premiumUntil > new Date()) {
                // User is renewing - extend from current expiry date
                premiumUntil = new Date(currentUser.premiumUntil);
                premiumUntil.setDate(premiumUntil.getDate() + 30);
                this.logger.log(`Renewal: extending from ${currentUser.premiumUntil.toISOString()} to ${premiumUntil.toISOString()}`);
            } else {
                // New subscription - start from now
                premiumUntil = new Date();
                premiumUntil.setDate(premiumUntil.getDate() + 30);
            }

            // Create payment record
            const payment = await this.prisma.payment.create({
                data: {
                    userId,
                    txHash,
                    amount: this.MONTHLY_PRICE_USD,
                    currency: 'USDT',
                    network: network,
                    status: 'verified',
                    subscriptionMonths: 1,
                    verifiedAt: new Date(),
                }
            });

            // Update user subscription
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    tier: 'premium',
                    subscriptionStatus: 'active',
                    premiumUntil,
                    lastPaymentDate: new Date(),
                },
            });

            this.logger.log(`User ${user.email} upgraded to premium until ${premiumUntil.toISOString()}`);

            return {
                success: true,
                message: `Payment verified! You now have Premium access until ${premiumUntil.toLocaleDateString()}.`,
                tier: user.tier,
                premiumUntil: premiumUntil.toISOString(),
            };
        } catch (error) {
            this.logger.error(`Error verifying payment: ${error.message}`);
            return {
                success: false,
                message: 'Failed to process payment. Please contact support.'
            };
        }
    }

    /**
     * Check and expire subscriptions that have passed their end date
     * This should be run by a cron job daily
     */
    async checkExpiredSubscriptions() {
        const now = new Date();

        const expiredUsers = await this.prisma.user.updateMany({
            where: {
                subscriptionStatus: 'active',
                premiumUntil: {
                    lt: now
                }
            },
            data: {
                tier: 'free',
                subscriptionStatus: 'expired'
            }
        });

        this.logger.log(`Expired ${expiredUsers.count} subscriptions`);
        return expiredUsers.count;
    }

    /**
     * Get user's payment history
     */
    async getPaymentHistory(userId: string) {
        return this.prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get subscription status for a user
     */
    async getSubscriptionStatus(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                tier: true,
                subscriptionStatus: true,
                premiumUntil: true,
                lastPaymentDate: true,
            }
        });

        if (!user) {
            return null;
        }

        const now = new Date();
        const daysRemaining = user.premiumUntil
            ? Math.ceil((user.premiumUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        return {
            ...user,
            daysRemaining,
            isActive: user.subscriptionStatus === 'active' && daysRemaining > 0,
            needsRenewal: daysRemaining <= 7 && daysRemaining > 0,
        };
    }
}
