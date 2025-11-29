import { PrismaService } from '../prisma/prisma.service';
import { PriceService } from '../price/price.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export interface PortfolioAsset {
    token: string;
    amount: number;
    value: number;
    allocation: number;
    chain: string;
}
export interface PortfolioSummary {
    totalValue: number;
    assets: PortfolioAsset[];
    performance24h?: number;
    performance7d?: number;
    performance30d?: number;
}
export declare class PortfolioService {
    private prisma;
    private priceService;
    private blockchainService;
    private realtimeGateway;
    constructor(prisma: PrismaService, priceService: PriceService, blockchainService: BlockchainService, realtimeGateway: RealtimeGateway);
    getUserPortfolio(userId: string): Promise<PortfolioSummary>;
    createSnapshot(userId: string): Promise<void>;
    getPortfolioHistory(userId: string, days?: number): Promise<{
        id: string;
        userId: string;
        totalValueUsd: import("@prisma/client/runtime/library").Decimal;
        snapshotAt: Date;
    }[]>;
    getPerformance(userId: string): Promise<{
        change24h: number;
        change7d: number;
        change30d: number;
    }>;
    broadcastPortfolioUpdate(userId: string): Promise<void>;
}
