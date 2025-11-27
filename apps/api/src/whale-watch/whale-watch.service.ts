import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService, BlockchainTransaction } from '../blockchain/blockchain.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

export interface WhaleTransaction {
    hash: string;
    from: string;
    fromLabel?: string;
    to: string;
    toLabel?: string;
    value: string;
    valueUsd?: number;
    token: string;
    timestamp: number;
    chain: string;
    isToExchange?: boolean;
    isFromExchange?: boolean;
}

@Injectable()
export class WhaleWatchService implements OnModuleInit {
    private cachedTransactions: WhaleTransaction[] = [];
    private lastFetch: number = 0;
    private readonly CACHE_DURATION = 60000; // 1 minute cache

    constructor(
        private prisma: PrismaService,
        private blockchainService: BlockchainService,
        private realtimeGateway: RealtimeGateway,
    ) { }

    async onModuleInit() {
        // Start fetching whale transactions on app startup
        await this.fetchAndStoreWhaleTransactions();

        // Set up periodic updates every 2 minutes
        setInterval(async () => {
            await this.fetchAndStoreWhaleTransactions();
        }, 120000); // 2 minutes
    }

    /**
     * Get whale transactions (from cache or database)
     */
    async getWhaleTransactions(limit: number = 20): Promise<WhaleTransaction[]> {
        const now = Date.now();

        // Return cached data if fresh
        if (this.cachedTransactions.length > 0 && now - this.lastFetch < this.CACHE_DURATION) {
            return this.cachedTransactions.slice(0, limit);
        }

        // Fetch from database
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

    /**
     * Fetch new whale transactions from blockchain and store in database
     */
    private async fetchAndStoreWhaleTransactions(): Promise<void> {
        try {
            console.log('[WhaleWatch] Fetching new whale transactions...');

            // Fetch large ETH transactions (> 100 ETH)
            const ethTransactions = await this.blockchainService.getRecentLargeEthTransactions(100);

            // Get ETH price for USD conversion
            const ethPrice = await this.blockchainService.getEthPrice();

            for (const tx of ethTransactions) {
                try {
                    // Check if transaction already exists
                    const existing = await this.prisma.whaleTransaction.findUnique({
                        where: { hash: tx.hash },
                    });

                    if (existing) {
                        continue; // Skip if already stored
                    }

                    // Get wallet labels
                    const fromInfo = this.blockchainService.getWalletLabel(tx.from);
                    const toInfo = this.blockchainService.getWalletLabel(tx.to);

                    // Calculate USD value
                    const valueUsd = parseFloat(tx.value) * ethPrice;

                    // Store in database
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

                    // Broadcast event
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

                    // Check if any users have alerts for this wallet
                    await this.checkAlerts(tx, fromInfo, toInfo);

                } catch (error) {
                    console.error(`[WhaleWatch] Error storing transaction ${tx.hash}:`, error.message);
                }
            }

            console.log(`[WhaleWatch] Checked ${ethTransactions.length} transactions`);

        } catch (error) {
            console.error('[WhaleWatch] Error fetching whale transactions:', error);
        }
    }

    /**
     * Check if transaction matches any user alerts
     */
    private async checkAlerts(
        tx: BlockchainTransaction,
        fromInfo: { label: string | null; isExchange: boolean },
        toInfo: { label: string | null; isExchange: boolean },
    ): Promise<void> {
        try {
            // Find alerts for this wallet address
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
                // TODO: Send notification to user (Telegram, Email)
                console.log(`[WhaleWatch] Alert triggered for user ${alert.user.email}: ${tx.hash}`);
            }

        } catch (error) {
            console.error('[WhaleWatch] Error checking alerts:', error);
        }
    }

    /**
     * Get transactions for a specific wallet address
     */
    async getWalletTransactions(address: string, limit: number = 10): Promise<WhaleTransaction[]> {
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
}
