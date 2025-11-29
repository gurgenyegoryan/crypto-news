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
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const price_service_1 = require("../price/price.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let PortfolioService = class PortfolioService {
    prisma;
    priceService;
    blockchainService;
    realtimeGateway;
    constructor(prisma, priceService, blockchainService, realtimeGateway) {
        this.prisma = prisma;
        this.priceService = priceService;
        this.blockchainService = blockchainService;
        this.realtimeGateway = realtimeGateway;
    }
    async getUserPortfolio(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId },
        });
        const assets = [];
        let totalValue = 0;
        for (const wallet of wallets) {
            let balance = 0;
            let token = 'ETH';
            let price = 0;
            try {
                const balanceStr = await this.blockchainService.getBalance(wallet.address, wallet.chain);
                balance = parseFloat(balanceStr);
                const chain = wallet.chain.toLowerCase();
                if (chain === 'eth' || chain === 'ethereum') {
                    token = 'ETH';
                    price = await this.priceService.getPrice('ethereum') || 0;
                }
                else if (chain === 'btc' || chain === 'bitcoin') {
                    token = 'BTC';
                    price = await this.priceService.getPrice('bitcoin') || 0;
                }
                else if (chain === 'sol' || chain === 'solana') {
                    token = 'SOL';
                    price = await this.priceService.getPrice('solana') || 0;
                }
                else if (chain === 'bnb' || chain === 'bsc') {
                    token = 'BNB';
                    price = await this.priceService.getPrice('binancecoin') || 0;
                }
                else {
                    token = chain.toUpperCase();
                    price = 0;
                }
                const value = balance * price;
                assets.push({
                    token,
                    amount: balance,
                    value,
                    allocation: 0,
                    chain: wallet.chain,
                });
                totalValue += value;
            }
            catch (error) {
                console.error(`Error fetching balance for wallet ${wallet.address}:`, error);
                assets.push({
                    token,
                    amount: 0,
                    value: 0,
                    allocation: 0,
                    chain: wallet.chain,
                });
            }
        }
        assets.forEach(asset => {
            asset.allocation = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
        });
        let performance24h = 0;
        let performance7d = 0;
        let performance30d = 0;
        try {
            const performance = await this.getPerformance(userId);
            performance24h = performance.change24h;
            performance7d = performance.change7d;
            performance30d = performance.change30d;
        }
        catch (error) {
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
    async createSnapshot(userId) {
        const portfolio = await this.getUserPortfolio(userId);
        await this.prisma.portfolioSnapshot.create({
            data: {
                userId,
                totalValueUsd: portfolio.totalValue,
                snapshotAt: new Date(),
            },
        });
    }
    async getPortfolioHistory(userId, days = 30) {
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
    async getPerformance(userId) {
        const snapshots = await this.prisma.portfolioSnapshot.findMany({
            where: { userId },
            orderBy: { snapshotAt: 'desc' },
            take: 30,
        });
        if (snapshots.length === 0) {
            return { change24h: 0, change7d: 0, change30d: 0 };
        }
        const current = parseFloat(snapshots[0].totalValueUsd.toString());
        const day1Snapshot = snapshots.find(s => Date.now() - s.snapshotAt.getTime() >= 24 * 3600000);
        const day7Snapshot = snapshots.find(s => Date.now() - s.snapshotAt.getTime() >= 7 * 24 * 3600000);
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
    async broadcastPortfolioUpdate(userId) {
        try {
            const portfolio = await this.getUserPortfolio(userId);
            this.realtimeGateway.sendUserUpdate(userId, 'portfolioUpdate', portfolio);
        }
        catch (error) {
            console.error(`Error broadcasting portfolio for user ${userId}:`, error);
        }
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        price_service_1.PriceService,
        blockchain_service_1.BlockchainService,
        realtime_gateway_1.RealtimeGateway])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map