import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceService } from '../price/price.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

export interface PortfolioAsset {
    token: string;
    amount: number;
    value: number;
    allocation: number; // percentage
    chain: string;
}

export interface PortfolioSummary {
    totalValue: number;
    assets: PortfolioAsset[];
    performance24h?: number;
    performance7d?: number;
    performance30d?: number;
}

@Injectable()
export class PortfolioService {
    constructor(
        private prisma: PrismaService,
        private priceService: PriceService,
        private blockchainService: BlockchainService,
        private realtimeGateway: RealtimeGateway,
    ) { }

    /**
     * Get user's complete portfolio
     */
    async getUserPortfolio(userId: string): Promise<PortfolioSummary> {
        // Get all user wallets
        const wallets = await this.prisma.wallet.findMany({
            where: { userId },
        });

        const assets: PortfolioAsset[] = [];
        let totalValue = 0;

        // Fetch balances for each wallet based on chain
        for (const wallet of wallets) {
            let balance = 0;
            let token = 'ETH';
            let price = 0;

            try {
                // Fetch real balance using centralized BlockchainService
                const balanceStr = await this.blockchainService.getBalance(wallet.address, wallet.chain);
                balance = parseFloat(balanceStr);

                // Determine token and price based on chain
                const chain = wallet.chain.toLowerCase();

                if (chain === 'eth' || chain === 'ethereum') {
                    token = 'ETH';
                    price = await this.priceService.getPrice('ethereum') || 0;
                } else if (chain === 'btc' || chain === 'bitcoin') {
                    token = 'BTC';
                    price = await this.priceService.getPrice('bitcoin') || 0;
                } else if (chain === 'sol' || chain === 'solana') {
                    token = 'SOL';
                    price = await this.priceService.getPrice('solana') || 0;
                } else if (chain === 'bnb' || chain === 'bsc') {
                    token = 'BNB';
                    price = await this.priceService.getPrice('binancecoin') || 0;
                } else {
                    // Default fallback
                    token = chain.toUpperCase();
                    price = 0;
                }

                const value = balance * price;

                // Only add if balance > 0 or if we want to show all wallets
                assets.push({
                    token,
                    amount: balance,
                    value,
                    allocation: 0, // Will calculate after
                    chain: wallet.chain,
                });

                totalValue += value;
            } catch (error) {
                console.error(`Error fetching balance for wallet ${wallet.address}:`, error);
                // Still add the wallet but with 0 balance
                assets.push({
                    token,
                    amount: 0,
                    value: 0,
                    allocation: 0,
                    chain: wallet.chain,
                });
            }
        }

        // Calculate allocations
        assets.forEach(asset => {
            asset.allocation = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
        });

        // Calculate performance metrics
        let performance24h = 0;
        let performance7d = 0;
        let performance30d = 0;

        try {
            const performance = await this.getPerformance(userId);
            performance24h = performance.change24h;
            performance7d = performance.change7d;
            performance30d = performance.change30d;
        } catch (error) {
            console.error('Error calculating performance:', error);
        }

        return {
            totalValue,
            assets,
            performance24h,
            performance7d,
            performance30d,
        };
    }

    /**
     * Take a snapshot of user's portfolio
     */
    async createSnapshot(userId: string): Promise<void> {
        const portfolio = await this.getUserPortfolio(userId);

        await this.prisma.portfolioSnapshot.create({
            data: {
                userId,
                totalValueUsd: portfolio.totalValue,
                snapshotAt: new Date(),
            },
        });
    }

    /**
     * Get portfolio history
     */
    async getPortfolioHistory(userId: string, days: number = 30) {
        const since = new Date(Date.now() - days * 24 * 3600000);

        return this.prisma.portfolioSnapshot.findMany({
            where: {
                userId,
                snapshotAt: {
                    gte: since,
                },
            },
            orderBy: { snapshotAt: 'asc' },
        });
    }

    /**
     * Calculate portfolio performance
     */
    async getPerformance(userId: string): Promise<{
        change24h: number;
        change7d: number;
        change30d: number;
    }> {
        const snapshots = await this.prisma.portfolioSnapshot.findMany({
            where: { userId },
            orderBy: { snapshotAt: 'desc' },
            take: 30,
        });

        if (snapshots.length === 0) {
            return { change24h: 0, change7d: 0, change30d: 0 };
        }

        const current = parseFloat(snapshots[0].totalValueUsd.toString());

        // Find snapshot from 24h ago
        const day1Snapshot = snapshots.find(s =>
            Date.now() - s.snapshotAt.getTime() >= 24 * 3600000
        );
        const day7Snapshot = snapshots.find(s =>
            Date.now() - s.snapshotAt.getTime() >= 7 * 24 * 3600000
        );
        const day30Snapshot = snapshots[snapshots.length - 1];

        const change24h = day1Snapshot
            ? ((current - parseFloat(day1Snapshot.totalValueUsd.toString())) / parseFloat(day1Snapshot.totalValueUsd.toString())) * 100
            : 0;

        const change7d = day7Snapshot
            ? ((current - parseFloat(day7Snapshot.totalValueUsd.toString())) / parseFloat(day7Snapshot.totalValueUsd.toString())) * 100
            : 0;

        const change30d = day30Snapshot
            ? ((current - parseFloat(day30Snapshot.totalValueUsd.toString())) / parseFloat(day30Snapshot.totalValueUsd.toString())) * 100
            : 0;

        return { change24h, change7d, change30d };
    }

    /**
     * Broadcast portfolio update to user
     */
    async broadcastPortfolioUpdate(userId: string) {
        try {
            const portfolio = await this.getUserPortfolio(userId);
            this.realtimeGateway.sendUserUpdate(userId, 'portfolioUpdate', portfolio);
        } catch (error) {
            console.error(`Error broadcasting portfolio for user ${userId}:`, error);
        }
    }
}
