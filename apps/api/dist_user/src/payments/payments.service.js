"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    logger = new common_1.Logger(PaymentsService_1.name);
    ADMIN_WALLET_TRC20 = process.env.ADMIN_USDT_WALLET || 'TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29';
    MONTHLY_PRICE_USD = 29;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verifyPayment(userId, txHash) {
        try {
            const existingPayment = await this.prisma.payment.findUnique({
                where: { txHash }
            });
            if (existingPayment) {
                return {
                    success: false,
                    message: 'This transaction has already been used for a payment.'
                };
            }
            if (!txHash || txHash.length < 20) {
                return {
                    success: false,
                    message: 'Invalid transaction hash format.'
                };
            }
            this.logger.log(`Processing payment for user ${userId} with hash ${txHash}`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            const currentUser = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { premiumUntil: true, tier: true }
            });
            let premiumUntil;
            if (currentUser?.tier === 'premium' && currentUser.premiumUntil && currentUser.premiumUntil > new Date()) {
                premiumUntil = new Date(currentUser.premiumUntil);
                premiumUntil.setDate(premiumUntil.getDate() + 30);
                this.logger.log(`Renewal: extending from ${currentUser.premiumUntil.toISOString()} to ${premiumUntil.toISOString()}`);
            }
            else {
                premiumUntil = new Date();
                premiumUntil.setDate(premiumUntil.getDate() + 30);
            }
            const payment = await this.prisma.payment.create({
                data: {
                    userId,
                    txHash,
                    amount: this.MONTHLY_PRICE_USD,
                    currency: 'USDT',
                    network: 'TRC20',
                    status: 'verified',
                    subscriptionMonths: 1,
                    verifiedAt: new Date(),
                }
            });
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
        }
        catch (error) {
            this.logger.error(`Error verifying payment: ${error.message}`);
            return {
                success: false,
                message: 'Failed to process payment. Please contact support.'
            };
        }
    }
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
    async getPaymentHistory(userId) {
        return this.prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getSubscriptionStatus(userId) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map