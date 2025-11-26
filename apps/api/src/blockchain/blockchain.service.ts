import { Injectable } from '@nestjs/common';
import { createPublicClient, http, PublicClient, formatEther } from 'viem';
import { mainnet } from 'viem/chains';
import axios from 'axios';

export interface BlockchainTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    valueUsd?: number;
    token: string;
    timestamp: number;
    blockNumber: number;
    chain: string;
}

interface KnownWallet {
    address: string;
    label: string;
    isExchange: boolean;
}

@Injectable()
export class BlockchainService {
    private ethClient: PublicClient;
    private knownWallets: Map<string, KnownWallet>;

    constructor() {
        // Using free public RPC (rate limited but sufficient for demo)
        this.ethClient = createPublicClient({
            chain: mainnet,
            transport: http('https://ethereum.publicnode.com'),
        });

        // Initialize known wallet labels
        this.knownWallets = new Map([
            // Major exchanges - Ethereum
            ['0x28c6c06298d514db089934071355e5743bf21d60', { address: '0x28c6c06298d514db089934071355e5743bf21d60', label: 'Binance Hot Wallet 1', isExchange: true }],
            ['0x21a31ee1afc51d94c2efccaa2092ad1028285549', { address: '0x21a31ee1afc51d94c2efccaa2092ad1028285549', label: 'Binance Hot Wallet 2', isExchange: true }],
            ['0xdfd5293d8e347dfe59e90efd55b2956a1343963d', { address: '0xdfd5293d8e347dfe59e90efd55b2956a1343963d', label: 'Binance Hot Wallet 3', isExchange: true }],
            ['0x56eddb7aa87536c09ccc2793473599fd21a8b17f', { address: '0x56eddb7aa87536c09ccc2793473599fd21a8b17f', label: 'Binance Hot Wallet 4', isExchange: true }],
            ['0x9696f59e4d72e237be84ffd425dcad154bf96976', { address: '0x9696f59e4d72e237be84ffd425dcad154bf96976', label: 'Binance Hot Wallet 5', isExchange: true }],
            ['0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67', { address: '0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67', label: 'Binance Hot Wallet 6', isExchange: true }],
            ['0xbe0eb53f46cd790cd13851d5eff43d12404d33e8', { address: '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8', label: 'Binance Hot Wallet 7', isExchange: true }],
            ['0xf977814e90da44bfa03b6295a0616a897441acec', { address: '0xf977814e90da44bfa03b6295a0616a897441acec', label: 'Binance Hot Wallet 8', isExchange: true }],

            // Coinbase
            ['0x71660c4005ba85c37ccec55d0c4493e66fe775d3', { address: '0x71660c4005ba85c37ccec55d0c4493e66fe775d3', label: 'Coinbase 1', isExchange: true }],
            ['0x503828976d22510aad0201ac7ec88293211d23da', { address: '0x503828976d22510aad0201ac7ec88293211d23da', label: 'Coinbase 2', isExchange: true }],
            ['0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740', { address: '0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740', label: 'Coinbase 3', isExchange: true }],
            ['0x3cd751e6b0078be393132286c442345e5dc49699', { address: '0x3cd751e6b0078be393132286c442345e5dc49699', label: 'Coinbase 4', isExchange: true }],
            ['0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511', { address: '0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511', label: 'Coinbase 5', isExchange: true }],
            ['0xeb2629a2734e272bcc07bda959863f316f4bd4cf', { address: '0xeb2629a2734e272bcc07bda959863f316f4bd4cf', label: 'Coinbase 6', isExchange: true }],

            // Kraken
            ['0x2910543af39aba0cd09dbb2d50200b3e800a63d2', { address: '0x2910543af39aba0cd09dbb2d50200b3e800a63d2', label: 'Kraken 1', isExchange: true }],
            ['0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13', { address: '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13', label: 'Kraken 2', isExchange: true }],
            ['0xe853c56864a2ebe4576a807d26fdc4a0ada51919', { address: '0xe853c56864a2ebe4576a807d26fdc4a0ada51919', label: 'Kraken 3', isExchange: true }],

            // Other major exchanges
            ['0x876eabf441b2ee5b5b0554fd502a8e0600950cfa', { address: '0x876eabf441b2ee5b5b0554fd502a8e0600950cfa', label: 'Bitfinex', isExchange: true }],
            ['0x742d35cc6634c0532925a3b844bc9e7595f0beb', { address: '0x742d35cc6634c0532925a3b844bc9e7595f0beb', label: 'Huobi 1', isExchange: true }],
            ['0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b', { address: '0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b', label: 'Huobi 2', isExchange: true }],
            ['0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98', { address: '0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98', label: 'Bittrex', isExchange: true }],

            // Famous wallets
            ['0xab5801a7d398351b8be11c439e05c5b3259aec9b', { address: '0xab5801a7d398351b8be11c439e05c5b3259aec9b', label: 'Vitalik Buterin', isExchange: false }],
            ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', { address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', label: 'Vitalik Buterin (vitalik.eth)', isExchange: false }],
        ]);
    }

    /**
     * Get label for a wallet address
     */
    getWalletLabel(address: string): { label: string | null; isExchange: boolean } {
        const lowerAddress = address.toLowerCase();
        const knownWallet = this.knownWallets.get(lowerAddress);

        if (knownWallet) {
            return { label: knownWallet.label, isExchange: knownWallet.isExchange };
        }

        return { label: null, isExchange: false };
    }

    /**
     * Fetch recent large ETH transactions using Etherscan API
     */
    async getRecentLargeEthTransactions(minValueEth: number = 100): Promise<BlockchainTransaction[]> {
        try {
            const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'; // Free tier available

            // Get the latest block
            const latestBlock = await this.ethClient.getBlockNumber();
            const block = await this.ethClient.getBlock({ blockNumber: latestBlock, includeTransactions: true });

            const largeTransactions: BlockchainTransaction[] = [];

            if (block && block.transactions) {
                for (const txHash of block.transactions) {
                    if (typeof txHash === 'string') {
                        try {
                            const tx = await this.ethClient.getTransaction({ hash: txHash as `0x${string}` });

                            if (tx && tx.value) {
                                const valueEth = parseFloat(formatEther(tx.value));

                                // Only include large transactions
                                if (valueEth >= minValueEth) {
                                    const fromInfo = this.getWalletLabel(tx.from);
                                    const toInfo = tx.to ? this.getWalletLabel(tx.to) : { label: null, isExchange: false };

                                    largeTransactions.push({
                                        hash: tx.hash,
                                        from: tx.from,
                                        to: tx.to || '',
                                        value: valueEth.toFixed(4),
                                        token: 'ETH',
                                        timestamp: Number(block.timestamp) * 1000,
                                        blockNumber: Number(tx.blockNumber),
                                        chain: 'Ethereum',
                                    });
                                }
                            }
                        } catch (error) {
                            // Skip failed transactions
                            continue;
                        }
                    }
                }
            }

            return largeTransactions;
        } catch (error) {
            console.error('Error fetching ETH transactions:', error);
            return [];
        }
    }

    /**
     * Fetch transactions for a specific wallet address
     */
    async getAddressTransactions(address: string, chain: string = 'ethereum'): Promise<BlockchainTransaction[]> {
        try {
            if (chain === 'ethereum') {
                const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
                const response = await axios.get(`https://api.etherscan.io/api`, {
                    params: {
                        module: 'account',
                        action: 'txlist',
                        address: address,
                        startblock: 0,
                        endblock: 99999999,
                        page: 1,
                        offset: 10,
                        sort: 'desc',
                        apikey: apiKey,
                    },
                });

                if (response.data.status === '1' && response.data.result) {
                    return response.data.result.map((tx: any) => {
                        const valueEth = parseFloat(formatEther(BigInt(tx.value)));
                        const fromInfo = this.getWalletLabel(tx.from);
                        const toInfo = this.getWalletLabel(tx.to);

                        return {
                            hash: tx.hash,
                            from: tx.from,
                            to: tx.to,
                            value: valueEth.toFixed(4),
                            token: 'ETH',
                            timestamp: parseInt(tx.timeStamp) * 1000,
                            blockNumber: parseInt(tx.blockNumber),
                            chain: 'Ethereum',
                        };
                    });
                }
            }

            return [];
        } catch (error) {
            console.error('Error fetching address transactions:', error);
            return [];
        }
    }

    /**
     * Get current ETH price from CoinGecko (free API)
     */
    async getEthPrice(): Promise<number> {
        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
                params: {
                    ids: 'ethereum',
                    vs_currencies: 'usd',
                },
            });

            return response.data.ethereum.usd;
        } catch (error) {
            console.error('Error fetching ETH price:', error);
            return 0;
        }
    }

    /**
     * Get balance for an address
     */
    async getBalance(address: string, chain: string = 'ethereum'): Promise<string> {
        try {
            const normalizedChain = chain.toLowerCase();

            if (normalizedChain === 'eth' || normalizedChain === 'ethereum') {
                const balance = await this.ethClient.getBalance({
                    address: address as `0x${string}`
                });
                return formatEther(balance);
            }

            if (normalizedChain === 'btc' || normalizedChain === 'bitcoin') {
                // Use mempool.space API (Free, no key required)
                const response = await axios.get(`https://mempool.space/api/address/${address}`);
                const satoshis = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
                return (satoshis / 100000000).toFixed(8);
            }

            if (normalizedChain === 'sol' || normalizedChain === 'solana') {
                // Use Solana public RPC
                const response = await axios.post('https://api.mainnet-beta.solana.com', {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getBalance",
                    params: [address]
                });

                if (response.data.result && response.data.result.value) {
                    return (response.data.result.value / 1000000000).toFixed(4);
                }
                return "0.0000";
            }

            return "0.0000";
        } catch (error) {
            // Assuming 'this.logger' is available or fallback to console.error
            // If this.logger is not defined, this will cause an error.
            // For now, I'll assume it's a placeholder for a logger or needs to be console.error
            // Given the original code uses console.error, I will use that for consistency
            console.error(`Error fetching balance for ${address} on ${chain}: ${error.message}`);
            return "0.0000";
        }
    }

    /**
     * Monitor a specific wallet for new transactions
     */
    async monitorWallet(address: string, callback: (tx: BlockchainTransaction) => void): Promise<void> {
        // This would use WebSocket in production
        // For now, we'll poll every 15 seconds
        setInterval(async () => {
            const transactions = await this.getAddressTransactions(address);
            if (transactions.length > 0) {
                callback(transactions[0]); // Most recent transaction
            }
        }, 15000);
    }
}
