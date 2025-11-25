import { Injectable } from '@nestjs/common';

export interface WhaleTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    token: string;
    timestamp: number;
    chain: string;
}

@Injectable()
export class WhaleWatchService {
    // Simulated whale transactions
    getWhaleTransactions(): WhaleTransaction[] {
        const now = Date.now();
        return [
            {
                hash: '0x3a1b...9c2d',
                from: 'Binance Cold Wallet',
                to: '0x742d...44e',
                value: '1,500',
                token: 'BTC',
                timestamp: now - 1000 * 60 * 5, // 5 mins ago
                chain: 'Bitcoin'
            },
            {
                hash: '0x8f2e...1a4b',
                from: '0x47ac...D503',
                to: 'Coinbase',
                value: '25,000',
                token: 'ETH',
                timestamp: now - 1000 * 60 * 12, // 12 mins ago
                chain: 'Ethereum'
            },
            {
                hash: '0x5c6d...3e1f',
                from: 'Unknown Wallet',
                to: 'Kraken',
                value: '5,000,000',
                token: 'USDT',
                timestamp: now - 1000 * 60 * 25, // 25 mins ago
                chain: 'Tron'
            },
            {
                hash: '0x9a8b...7c6d',
                from: 'Justin Sun',
                to: 'Binance',
                value: '150,000',
                token: 'SOL',
                timestamp: now - 1000 * 60 * 45, // 45 mins ago
                chain: 'Solana'
            },
            {
                hash: '0x1e2f...3a4b',
                from: 'Vitalik Buterin',
                to: '0xd8dA...6031',
                value: '500',
                token: 'ETH',
                timestamp: now - 1000 * 60 * 60, // 1 hour ago
                chain: 'Ethereum'
            }
        ];
    }
}
