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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyTradingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CopyTradingService = class CopyTradingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserConfigs(userId) {
        const configs = await this.prisma.copyTradingConfig.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return configs.map(c => ({
            id: c.id,
            followedWallet: c.followedWallet,
            chain: c.chain,
            maxAmountPerTrade: parseFloat(c.maxAmountPerTrade.toString()),
            stopLossPercent: c.stopLossPercent ? parseFloat(c.stopLossPercent.toString()) : undefined,
            takeProfitPercent: c.takeProfitPercent ? parseFloat(c.takeProfitPercent.toString()) : undefined,
            active: c.active,
        }));
    }
    async createConfig(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.tier !== 'premium' && user.tier !== 'pro') {
            throw new common_1.ForbiddenException('Copy trading is only available for Pro users');
        }
        const configCount = await this.prisma.copyTradingConfig.count({ where: { userId } });
        if (user.tier === 'premium' && configCount >= 3) {
            throw new common_1.ForbiddenException('Premium tier limited to 3 copy trading configs. Upgrade to Pro for unlimited.');
        }
        return this.prisma.copyTradingConfig.create({
            data: {
                userId,
                followedWallet: data.followedWallet.toLowerCase(),
                chain: data.chain,
                maxAmountPerTrade: data.maxAmountPerTrade,
                stopLossPercent: data.stopLossPercent,
                takeProfitPercent: data.takeProfitPercent,
                active: true,
            },
        });
    }
    async toggleConfig(userId, configId) {
        const config = await this.prisma.copyTradingConfig.findFirst({
            where: { id: configId, userId },
        });
        if (!config) {
            throw new Error('Config not found');
        }
        return this.prisma.copyTradingConfig.update({
            where: { id: configId },
            data: { active: !config.active },
        });
    }
    async deleteConfig(userId, configId) {
        const config = await this.prisma.copyTradingConfig.findFirst({
            where: { id: configId, userId },
        });
        if (!config) {
            throw new Error('Config not found');
        }
        return this.prisma.copyTradingConfig.delete({
            where: { id: configId },
        });
    }
    async getTradeHistory(userId, limit = 50) {
        return this.prisma.copyTrade.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                config: true,
            },
        });
    }
    async getConfigPerformance(userId, configId) {
        const trades = await this.prisma.copyTrade.findMany({
            where: {
                userId,
                configId,
                status: 'executed',
            },
        });
        if (trades.length === 0) {
            return {
                totalTrades: 0,
                profitableTrades: 0,
                totalProfit: 0,
                winRate: 0,
            };
        }
        const profitableTrades = trades.filter(t => t.profit && parseFloat(t.profit.toString()) > 0);
        const totalProfit = trades.reduce((sum, t) => sum + (t.profit ? parseFloat(t.profit.toString()) : 0), 0);
        return {
            totalTrades: trades.length,
            profitableTrades: profitableTrades.length,
            totalProfit,
            winRate: (profitableTrades.length / trades.length) * 100,
        };
    }
    async executeCopyTrade(configId, whaleTransaction) {
        const config = await this.prisma.copyTradingConfig.findUnique({
            where: { id: configId },
        });
        if (!config || !config.active) {
            return;
        }
        await this.prisma.copyTrade.create({
            data: {
                userId: config.userId,
                configId: config.id,
                whaleWallet: whaleTransaction.from,
                whaleTxHash: whaleTransaction.hash,
                status: 'pending',
                tokenIn: 'ETH',
                tokenOut: 'USDT',
                amountIn: parseFloat(config.maxAmountPerTrade.toString()),
            },
        });
        console.log(`[CopyTrading] Simulated copy trade for config ${configId}`);
    }
};
exports.CopyTradingService = CopyTradingService;
exports.CopyTradingService = CopyTradingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CopyTradingService);
//# sourceMappingURL=copy-trading.service.js.map