import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class WalletsService {
    constructor(
        private prisma: PrismaService,
        private blockchainService: BlockchainService
    ) { }

    async create(userId: string, data: Prisma.WalletCreateWithoutUserInput) {
        // Enforce non‑premium limit: only one wallet allowed for free users
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.tier !== 'premium') {
            const existingCount = await this.prisma.wallet.count({ where: { userId } });
            if (existingCount >= 1) {
                throw new Error('Free tier limit reached. Please upgrade to Premium to add more wallets.');
            }
        }

        // Fetch initial balance
        const balance = await this.blockchainService.getBalance(data.address, data.chain);

        return this.prisma.wallet.create({
            data: {
                ...data,
                userId,
                // Balance is fetched on demand; not stored in DB for now
            },
        });
    }

    async findAll(userId: string) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId },
        });

        // Fetch current balances for all wallets
        const walletsWithBalances = await Promise.all(wallets.map(async (wallet) => {
            const balance = await this.blockchainService.getBalance(wallet.address, wallet.chain);
            return { ...wallet, balance };
        }));

        return walletsWithBalances;
    }

    async remove(id: string, userId: string) {
        return this.prisma.wallet.deleteMany({
            where: { id, userId },
        });
    }
}
