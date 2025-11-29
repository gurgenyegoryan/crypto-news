import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PriceService } from '../price/price.service';
export interface BlockchainBalance {
    chain: string;
    balance: string;
    balanceUsd: number;
}
export interface BlockchainTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: number;
    blockNumber: number;
    token: string;
    chain: string;
}
export declare class BlockchainService {
    private realtimeGateway;
    private priceService;
    private readonly logger;
    private ethClient;
    private knownWallets;
    constructor(realtimeGateway: RealtimeGateway, priceService: PriceService);
    getWalletLabel(address: string): {
        label: string | null;
        isExchange: boolean;
    };
    getRecentLargeEthTransactions(minValueEth?: number): Promise<BlockchainTransaction[]>;
    getAddressTransactions(address: string, chain?: string): Promise<BlockchainTransaction[]>;
    getEthPrice(): Promise<number>;
    getBalance(address: string, chain?: string): Promise<string>;
    getTokenBalance(walletAddress: string, tokenContract: string, chain?: string, decimals?: number): Promise<string>;
    monitorWallet(address: string, userId: string): Promise<void>;
}
