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
exports.WhaleWatchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const email_service_1 = require("../email/email.service");
let WhaleWatchService = class WhaleWatchService {
    prisma;
    blockchainService;
    realtimeGateway;
    emailService;
    cachedTransactions = [];
    lastFetch = 0;
    CACHE_DURATION = 60000;
    constructor(prisma, blockchainService, realtimeGateway, emailService) {
        this.prisma = prisma;
        this.blockchainService = blockchainService;
        this.realtimeGateway = realtimeGateway;
        this.emailService = emailService;
    }
    async onModuleInit() {
        await this.fetchAndStoreWhaleTransactions();
        setInterval(async () => {
            await this.fetchAndStoreWhaleTransactions();
        }, 120000);
    }
    async getWhaleTransactions(limit = 20) {
        const now = Date.now();
        if (this.cachedTransactions.length > 0 && now - this.lastFetch < this.CACHE_DURATION) {
            return this.cachedTransactions.slice(0, limit);
        }
        const dbTransactions = await this.prisma.whaleTransaction.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
        const formattedTransactions = dbTransactions.map(tx => ({
            hash: tx.hash,
            from: tx.fromAddress,
            fromLabel: tx.fromLabel || undefined,
            to: tx.toAddress,
            toLabel: tx.toLabel || undefined,
            value: tx.value,
            valueUsd: tx.valueUsd ? parseFloat(tx.valueUsd.toString()) : undefined,
            token: tx.token,
            timestamp: tx.timestamp.getTime(),
            chain: tx.chain,
            isToExchange: tx.isToExchange,
            isFromExchange: tx.isFromExchange,
        }));
        this.cachedTransactions = formattedTransactions;
        this.lastFetch = now;
        return formattedTransactions;
    }
    async fetchAndStoreWhaleTransactions() {
        try {
            console.log('[WhaleWatch] Fetching new whale transactions...');
            const ethTransactions = await this.blockchainService.getRecentLargeEthTransactions(1);
            const ethPrice = await this.blockchainService.getEthPrice();
            for (const tx of ethTransactions) {
                try {
                    const existing = await this.prisma.whaleTransaction.findUnique({
                        where: { hash: tx.hash },
                    });
                    if (existing) {
                        continue;
                    }
                    const fromInfo = this.blockchainService.getWalletLabel(tx.from);
                    const toInfo = this.blockchainService.getWalletLabel(tx.to);
                    const valueUsd = parseFloat(tx.value) * ethPrice;
                    const savedTx = await this.prisma.whaleTransaction.create({
                        data: {
                            hash: tx.hash,
                            fromAddress: tx.from,
                            fromLabel: fromInfo.label,
                            toAddress: tx.to,
                            toLabel: toInfo.label,
                            value: tx.value,
                            valueUsd: valueUsd,
                            token: tx.token,
                            chain: tx.chain,
                            timestamp: new Date(tx.timestamp),
                            blockNumber: tx.blockNumber,
                            isToExchange: toInfo.isExchange,
                            isFromExchange: fromInfo.isExchange,
                        },
                    });
                    console.log(`[WhaleWatch] Stored transaction: ${tx.hash.substring(0, 10)}... (${tx.value} ETH)`);
                    this.realtimeGateway.broadcastGlobal('whale-movement', {
                        hash: savedTx.hash,
                        from: savedTx.fromAddress,
                        fromLabel: savedTx.fromLabel,
                        to: savedTx.toAddress,
                        toLabel: savedTx.toLabel,
                        value: savedTx.value,
                        valueUsd: savedTx.valueUsd,
                        token: savedTx.token,
                        timestamp: savedTx.timestamp.getTime(),
                        chain: savedTx.chain,
                        isToExchange: savedTx.isToExchange,
                        isFromExchange: savedTx.isFromExchange,
                    });
                    await this.checkAlerts(tx, fromInfo, toInfo);
                }
                catch (error) {
                    console.error(`[WhaleWatch] Error storing transaction ${tx.hash}:`, error.message);
                }
            }
            console.log(`[WhaleWatch] Checked ${ethTransactions.length} transactions`);
        }
        catch (error) {
            console.error('[WhaleWatch] Error fetching whale transactions:', error);
        }
    }
    async checkAlerts(tx, fromInfo, toInfo) {
        try {
            const alerts = await this.prisma.whaleAlert.findMany({
                where: {
                    OR: [
                        { walletAddress: tx.from.toLowerCase() },
                        { walletAddress: tx.to.toLowerCase() },
                    ],
                    active: true,
                    minAmount: {
                        lte: parseFloat(tx.value),
                    },
                },
                include: {
                    user: true,
                },
            });
            for (const alert of alerts) {
                await this.emailService.sendWhaleAlert(alert.user.email, {
                    token: tx.token,
                    amount: tx.value,
                    valueUsd: parseFloat(tx.value) * 2000,
                    from: tx.from,
                    to: tx.to,
                });
                console.log(`[WhaleWatch] Alert triggered for user ${alert.user.email}: ${tx.hash}`);
            }
        }
        catch (error) {
            console.error('[WhaleWatch] Error checking alerts:', error);
        }
    }
    async getWalletTransactions(address, limit = 10) {
        const transactions = await this.prisma.whaleTransaction.findMany({
            where: {
                OR: [
                    { fromAddress: address.toLowerCase() },
                    { toAddress: address.toLowerCase() },
                ],
            },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
        return transactions.map(tx => ({
            hash: tx.hash,
            from: tx.fromAddress,
            fromLabel: tx.fromLabel || undefined,
            to: tx.toAddress,
            toLabel: tx.toLabel || undefined,
            value: tx.value,
            valueUsd: tx.valueUsd ? parseFloat(tx.valueUsd.toString()) : undefined,
            token: tx.token,
            timestamp: tx.timestamp.getTime(),
            chain: tx.chain,
            isToExchange: tx.isToExchange,
            isFromExchange: tx.isFromExchange,
        }));
    }
};
exports.WhaleWatchService = WhaleWatchService;
exports.WhaleWatchService = WhaleWatchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService,
        realtime_gateway_1.RealtimeGateway,
        email_service_1.EmailService])
], WhaleWatchService);
//# sourceMappingURL=whale-watch.service.js.map