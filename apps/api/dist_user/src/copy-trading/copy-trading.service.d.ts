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
export declare class CopyTradingService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserConfigs(userId: string): Promise<CopyTradeConfig[]>;
    createConfig(userId: string, data: {
        followedWallet: string;
        chain: string;
        maxAmountPerTrade: number;
        stopLossPercent?: number;
        takeProfitPercent?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        chain: string;
        userId: string;
        followedWallet: string;
        maxAmountPerTrade: import("@prisma/client/runtime/library").Decimal;
        stopLossPercent: import("@prisma/client/runtime/library").Decimal | null;
        takeProfitPercent: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    toggleConfig(userId: string, configId: string): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        chain: string;
        userId: string;
        followedWallet: string;
        maxAmountPerTrade: import("@prisma/client/runtime/library").Decimal;
        stopLossPercent: import("@prisma/client/runtime/library").Decimal | null;
        takeProfitPercent: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    deleteConfig(userId: string, configId: string): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        chain: string;
        userId: string;
        followedWallet: string;
        maxAmountPerTrade: import("@prisma/client/runtime/library").Decimal;
        stopLossPercent: import("@prisma/client/runtime/library").Decimal | null;
        takeProfitPercent: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getTradeHistory(userId: string, limit?: number): Promise<({
        config: {
            id: string;
            createdAt: Date;
            active: boolean;
            chain: string;
            userId: string;
            followedWallet: string;
            maxAmountPerTrade: import("@prisma/client/runtime/library").Decimal;
            stopLossPercent: import("@prisma/client/runtime/library").Decimal | null;
            takeProfitPercent: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        whaleWallet: string;
        whaleTxHash: string;
        userTxHash: string | null;
        tokenIn: string;
        tokenOut: string;
        amountIn: import("@prisma/client/runtime/library").Decimal;
        amountOut: import("@prisma/client/runtime/library").Decimal | null;
        profit: import("@prisma/client/runtime/library").Decimal | null;
        executedAt: Date | null;
        configId: string;
    })[]>;
    getConfigPerformance(userId: string, configId: string): Promise<{
        totalTrades: number;
        profitableTrades: number;
        totalProfit: number;
        winRate: number;
    }>;
    executeCopyTrade(configId: string, whaleTransaction: any): Promise<void>;
}
