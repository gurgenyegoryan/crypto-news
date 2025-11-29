import { CopyTradingService } from './copy-trading.service';
export declare class CopyTradingController {
    private copyTradingService;
    constructor(copyTradingService: CopyTradingService);
    getConfigs(req: any): Promise<import("./copy-trading.service").CopyTradeConfig[]>;
    createConfig(req: any, body: {
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
    toggleConfig(req: any, id: string): Promise<{
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
    deleteConfig(req: any, id: string): Promise<{
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
    getHistory(req: any, limit?: string): Promise<({
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
    getPerformance(req: any, id: string): Promise<{
        totalTrades: number;
        profitableTrades: number;
        totalProfit: number;
        winRate: number;
    }>;
}
