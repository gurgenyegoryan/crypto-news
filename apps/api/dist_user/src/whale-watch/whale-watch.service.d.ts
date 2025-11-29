import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { EmailService } from '../email/email.service';
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
export declare class WhaleWatchService implements OnModuleInit {
    private prisma;
    private blockchainService;
    private realtimeGateway;
    private emailService;
    private cachedTransactions;
    private lastFetch;
    private readonly CACHE_DURATION;
    constructor(prisma: PrismaService, blockchainService: BlockchainService, realtimeGateway: RealtimeGateway, emailService: EmailService);
    onModuleInit(): Promise<void>;
    getWhaleTransactions(limit?: number): Promise<WhaleTransaction[]>;
    private fetchAndStoreWhaleTransactions;
    private checkAlerts;
    getWalletTransactions(address: string, limit?: number): Promise<WhaleTransaction[]>;
}
