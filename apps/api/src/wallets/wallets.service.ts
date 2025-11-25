import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class WalletsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: Prisma.WalletCreateWithoutUserInput) {
        // Enforce non‑premium limit: only one wallet allowed for free users
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.tier !== 'premium') {
            const existingCount = await this.prisma.wallet.count({ where: { userId } });
            if (existingCount >= 1) {
                throw new Error('Free tier users can only have one wallet');
            }
        }

        // Fetch initial balance
        const balance = await this.getBalance(data.address, data.chain);

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
            const balance = await this.getBalance(wallet.address, wallet.chain);
            return { ...wallet, balance };
        }));

        return walletsWithBalances;
    }

    async remove(id: string, userId: string) {
        return this.prisma.wallet.deleteMany({
            where: { id, userId },
        });
    }

    private async getBalance(address: string, chain: string = 'ETH'): Promise<string> {
        try {
            if (chain === 'ETH') {
                // Using a public RPC endpoint for Ethereum Mainnet
                const response = await axios.post('https://eth.llamarpc.com', {
                    jsonrpc: "2.0",
                    method: "eth_getBalance",
                    params: [address, "latest"],
                    id: 1
                });

                if (response.data.result) {
                    // Convert hex to decimal and divide by 10^18 (wei to eth)
                    const wei = parseInt(response.data.result, 16);
                    const eth = wei / 1e18;
                    return eth.toFixed(4);
                }
            } else if (chain === 'BTC') {
                // Simulated BTC balance
                return (Math.random() * 2).toFixed(4);
            } else if (chain === 'USDT') {
                // Simulated USDT balance
                return (Math.random() * 10000).toFixed(2);
            } else if (chain === 'SOL') {
                // Simulated SOL balance
                return (Math.random() * 50).toFixed(2);
            }

            return "0.0000";
        } catch (error) {
            console.error(`Error fetching balance for ${address}:`, error.message);
            return "0.0000";
        }
    }
}
