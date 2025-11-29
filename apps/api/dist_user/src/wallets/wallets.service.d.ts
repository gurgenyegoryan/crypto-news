import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BlockchainService } from '../blockchain/blockchain.service';
export declare class WalletsService {
    private prisma;
    private blockchainService;
    constructor(prisma: PrismaService, blockchainService: BlockchainService);
    create(userId: string, data: Prisma.WalletCreateWithoutUserInput): Promise<{
        id: string;
        createdAt: Date;
        address: string;
        chain: string;
        label: string | null;
        userId: string;
    }>;
    findAll(userId: string): Promise<{
        balance: string;
        id: string;
        createdAt: Date;
        address: string;
        chain: string;
        label: string | null;
        userId: string;
    }[]>;
    remove(id: string, userId: string): Promise<Prisma.BatchPayload>;
}
