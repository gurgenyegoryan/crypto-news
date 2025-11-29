import { PortfolioService } from './portfolio.service';
export declare class PortfolioController {
    private portfolioService;
    constructor(portfolioService: PortfolioService);
    getPortfolio(req: any): Promise<import("./portfolio.service").PortfolioSummary>;
    getHistory(req: any, days?: string): Promise<{
        id: string;
        userId: string;
        totalValueUsd: import("@prisma/client/runtime/library").Decimal;
        snapshotAt: Date;
    }[]>;
    getPerformance(req: any): Promise<{
        change24h: number;
        change7d: number;
        change30d: number;
    }>;
}
