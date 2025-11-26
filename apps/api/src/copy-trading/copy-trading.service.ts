import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CopyTradeConfig {
    id: string;
    followedWallet: string;
    chain: string;
    maxAmountPerTrade: number;
    stopLossPercent?: number;
    takeProfitPercent?: number;
    active: boolean;
}

@Injectable()
export class CopyTradingService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get user's copy trading configurations
     */
    async getUserConfigs(userId: string): Promise<CopyTradeConfig[]> {
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

    async createConfig(userId: string, data: {
        followedWallet: string;
        chain: string;
        maxAmountPerTrade: number;
        stopLossPercent?: number;
        takeProfitPercent?: number;
    }) {
        // Check user tier
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.tier !== 'premium' && user.tier !== 'pro') {
            throw new ForbiddenException('Copy trading is only available for Pro users');
        }

        // Check existing config count
        const configCount = await this.prisma.copyTradingConfig.count({ where: { userId } });

        if (user.tier === 'premium' && configCount >= 3) {
            throw new ForbiddenException('Premium tier limited to 3 copy trading configs. Upgrade to Pro for unlimited.');
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

    /**
     * Toggle config active status
     */
    async toggleConfig(userId: string, configId: string) {
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

    /**
     * Delete configuration
     */
    async deleteConfig(userId: string, configId: string) {
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

    /**
     * Get copy trade history
     */
    async getTradeHistory(userId: string, limit: number = 50) {
        return this.prisma.copyTrade.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                config: true,
            },
        });
    }

    /**
     * Get performance stats for a config
     */
    async getConfigPerformance(userId: string, configId: string) {
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

    /**
     * Execute a copy trade (simulated for now)
     */
    async executeCopyTrade(configId: string, whaleTransaction: any): Promise<void> {
        const config = await this.prisma.copyTradingConfig.findUnique({
            where: { id: configId },
        });

        if (!config || !config.active) {
            return;
        }

        // In production, this would:
        // 1. Parse the whale's DEX trade
        // 2. Calculate trade size based on maxAmountPerTrade
        // 3. Execute trade via DEX aggregator (1inch)
        // 4. Monitor for stop loss / take profit

        // For now, just log and store record
        await this.prisma.copyTrade.create({
            data: {
                userId: config.userId,
                configId: config.id,
                whaleWallet: whaleTransaction.from,
                whaleTxHash: whaleTransaction.hash,
                status: 'pending', // Would be 'executed' after actual trade
                tokenIn: 'ETH',
                tokenOut: 'USDT',
                amountIn: parseFloat(config.maxAmountPerTrade.toString()),
            },
        });

        console.log(`[CopyTrading] Simulated copy trade for config ${configId}`);
    }
}
