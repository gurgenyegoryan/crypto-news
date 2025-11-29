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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BlockchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const axios_1 = __importDefault(require("axios"));
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const price_service_1 = require("../price/price.service");
let BlockchainService = BlockchainService_1 = class BlockchainService {
    realtimeGateway;
    priceService;
    logger = new common_1.Logger(BlockchainService_1.name);
    ethClient;
    knownWallets;
    constructor(realtimeGateway, priceService) {
        this.realtimeGateway = realtimeGateway;
        this.priceService = priceService;
        this.ethClient = (0, viem_1.createPublicClient)({
            chain: chains_1.mainnet,
            transport: (0, viem_1.http)('https://ethereum.publicnode.com'),
        });
        this.knownWallets = new Map([
            ['0x28c6c06298d514db089934071355e5743bf21d60', { address: '0x28c6c06298d514db089934071355e5743bf21d60', label: 'Binance Hot Wallet 1', isExchange: true }],
            ['0x21a31ee1afc51d94c2efccaa2092ad1028285549', { address: '0x21a31ee1afc51d94c2efccaa2092ad1028285549', label: 'Binance Hot Wallet 2', isExchange: true }],
            ['0xdfd5293d8e347dfe59e90efd55b2956a1343963d', { address: '0xdfd5293d8e347dfe59e90efd55b2956a1343963d', label: 'Binance Hot Wallet 3', isExchange: true }],
            ['0x56eddb7aa87536c09ccc2793473599fd21a8b17f', { address: '0x56eddb7aa87536c09ccc2793473599fd21a8b17f', label: 'Binance Hot Wallet 4', isExchange: true }],
            ['0x9696f59e4d72e237be84ffd425dcad154bf96976', { address: '0x9696f59e4d72e237be84ffd425dcad154bf96976', label: 'Binance Hot Wallet 5', isExchange: true }],
            ['0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67', { address: '0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67', label: 'Binance Hot Wallet 6', isExchange: true }],
            ['0xbe0eb53f46cd790cd13851d5eff43d12404d33e8', { address: '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8', label: 'Binance Hot Wallet 7', isExchange: true }],
            ['0xf977814e90da44bfa03b6295a0616a897441acec', { address: '0xf977814e90da44bfa03b6295a0616a897441acec', label: 'Binance Hot Wallet 8', isExchange: true }],
            ['0x71660c4005ba85c37ccec55d0c4493e66fe775d3', { address: '0x71660c4005ba85c37ccec55d0c4493e66fe775d3', label: 'Coinbase 1', isExchange: true }],
            ['0x503828976d22510aad0201ac7ec88293211d23da', { address: '0x503828976d22510aad0201ac7ec88293211d23da', label: 'Coinbase 2', isExchange: true }],
            ['0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740', { address: '0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740', label: 'Coinbase 3', isExchange: true }],
            ['0x3cd751e6b0078be393132286c442345e5dc49699', { address: '0x3cd751e6b0078be393132286c442345e5dc49699', label: 'Coinbase 4', isExchange: true }],
            ['0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511', { address: '0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511', label: 'Coinbase 5', isExchange: true }],
            ['0xeb2629a2734e272bcc07bda959863f316f4bd4cf', { address: '0xeb2629a2734e272bcc07bda959863f316f4bd4cf', label: 'Coinbase 6', isExchange: true }],
            ['0x2910543af39aba0cd09dbb2d50200b3e800a63d2', { address: '0x2910543af39aba0cd09dbb2d50200b3e800a63d2', label: 'Kraken 1', isExchange: true }],
            ['0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13', { address: '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13', label: 'Kraken 2', isExchange: true }],
            ['0xe853c56864a2ebe4576a807d26fdc4a0ada51919', { address: '0xe853c56864a2ebe4576a807d26fdc4a0ada51919', label: 'Kraken 3', isExchange: true }],
            ['0x876eabf441b2ee5b5b0554fd502a8e0600950cfa', { address: '0x876eabf441b2ee5b5b0554fd502a8e0600950cfa', label: 'Bitfinex', isExchange: true }],
            ['0x742d35cc6634c0532925a3b844bc9e7595f0beb', { address: '0x742d35cc6634c0532925a3b844bc9e7595f0beb', label: 'Huobi 1', isExchange: true }],
            ['0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b', { address: '0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b', label: 'Huobi 2', isExchange: true }],
            ['0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98', { address: '0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98', label: 'Bittrex', isExchange: true }],
            ['0xab5801a7d398351b8be11c439e05c5b3259aec9b', { address: '0xab5801a7d398351b8be11c439e05c5b3259aec9b', label: 'Vitalik Buterin', isExchange: false }],
            ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', { address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', label: 'Vitalik Buterin (vitalik.eth)', isExchange: false }],
        ]);
    }
    getWalletLabel(address) {
        const lowerAddress = address.toLowerCase();
        const knownWallet = this.knownWallets.get(lowerAddress);
        if (knownWallet) {
            return { label: knownWallet.label, isExchange: knownWallet.isExchange };
        }
        return { label: null, isExchange: false };
    }
    async getRecentLargeEthTransactions(minValueEth = 100) {
        try {
            const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
            const latestBlockNumber = await this.ethClient.getBlockNumber();
            const largeTransactions = [];
            for (let i = 0; i < 10; i++) {
                const blockNumber = latestBlockNumber - BigInt(i);
                try {
                    const block = await this.ethClient.getBlock({ blockNumber, includeTransactions: true });
                    if (block && block.transactions) {
                        for (const txHash of block.transactions) {
                            if (typeof txHash === 'string') {
                                try {
                                    const tx = await this.ethClient.getTransaction({ hash: txHash });
                                    if (tx && tx.value) {
                                        const valueEth = parseFloat((0, viem_1.formatEther)(tx.value));
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
                                }
                                catch (error) {
                                    continue;
                                }
                            }
                        }
                    }
                }
                catch (error) {
                    console.error(`Error fetching block ${blockNumber}:`, error.message);
                    continue;
                }
            }
            return largeTransactions;
        }
        catch (error) {
            console.error('Error fetching ETH transactions:', error);
            return [];
        }
    }
    async getAddressTransactions(address, chain = 'ethereum') {
        try {
            if (chain === 'ethereum') {
                const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
                const response = await axios_1.default.get(`https://api.etherscan.io/api`, {
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
                    return response.data.result.map((tx) => {
                        const valueEth = parseFloat((0, viem_1.formatEther)(BigInt(tx.value)));
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
        }
        catch (error) {
            console.error('Error fetching address transactions:', error);
            return [];
        }
    }
    async getEthPrice() {
        const price = await this.priceService.getPrice('ETH');
        return price || 0;
    }
    async getBalance(address, chain = 'ethereum') {
        try {
            const normalizedChain = chain.toLowerCase();
            if (normalizedChain === 'eth' || normalizedChain === 'ethereum') {
                const balance = await this.ethClient.getBalance({
                    address: address
                });
                return (0, viem_1.formatEther)(balance);
            }
            if (normalizedChain === 'btc' || normalizedChain === 'bitcoin') {
                const response = await axios_1.default.get(`https://mempool.space/api/address/${address}`);
                const satoshis = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
                return (satoshis / 100000000).toFixed(8);
            }
            if (normalizedChain === 'sol' || normalizedChain === 'solana') {
                const response = await axios_1.default.post('https://api.mainnet-beta.solana.com', {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getBalance",
                    params: [address]
                });
                if (response.data.result && response.data.result.value) {
                    return (response.data.result.value / 1000000000).toFixed(4);
                }
            }
            if (normalizedChain === 'bnb' || normalizedChain === 'bsc') {
                const response = await axios_1.default.post('https://bsc-dataseed.binance.org/', {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "eth_getBalance",
                    params: [address, "latest"]
                });
                if (response.data.result) {
                    const balanceWei = parseInt(response.data.result, 16);
                    return (balanceWei / 1e18).toFixed(4);
                }
            }
            console.error(`Unsupported chain: ${chain}`);
            return "0.0000";
        }
        catch (error) {
            console.error(`Error fetching balance for ${address} on ${chain}: ${error.message}`);
            return "0.0000";
        }
    }
    async getTokenBalance(walletAddress, tokenContract, chain = 'ethereum', decimals = 18) {
        try {
            const normalizedChain = chain.toLowerCase();
            const balanceOfABI = [{
                    "constant": true,
                    "inputs": [{ "name": "_owner", "type": "address" }],
                    "name": "balanceOf",
                    "outputs": [{ "name": "balance", "type": "uint256" }],
                    "type": "function"
                }];
            if (normalizedChain === 'eth' || normalizedChain === 'ethereum') {
                const contract = (0, viem_1.getContract)({
                    address: tokenContract,
                    abi: balanceOfABI,
                    client: this.ethClient
                });
                const balance = await contract.read.balanceOf([walletAddress]);
                return (Number(balance) / Math.pow(10, decimals)).toFixed(decimals > 6 ? 6 : decimals);
            }
            if (normalizedChain === 'bnb' || normalizedChain === 'bsc') {
                const data = `0x70a08231000000000000000000000000${walletAddress.substring(2)}`;
                const response = await axios_1.default.post('https://bsc-dataseed.binance.org/', {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "eth_call",
                    params: [{
                            to: tokenContract,
                            data: data
                        }, "latest"]
                });
                if (response.data.result) {
                    const balance = parseInt(response.data.result, 16);
                    return (balance / Math.pow(10, decimals)).toFixed(decimals > 6 ? 6 : decimals);
                }
            }
            console.error(`Token balance not supported for chain: ${chain}`);
            return "0.0000";
        }
        catch (error) {
            console.error(`Error fetching token balance for ${walletAddress} on ${chain}: ${error.message}`);
            return "0.0000";
        }
    }
    async monitorWallet(address, userId) {
        setInterval(async () => {
            try {
                const transactions = await this.getAddressTransactions(address);
                if (transactions.length > 0) {
                    const latestTx = transactions[0];
                    this.realtimeGateway.sendUserUpdate(userId, 'walletTransaction', {
                        address,
                        transaction: latestTx
                    });
                }
            }
            catch (error) {
                console.error(`Error monitoring wallet ${address}:`, error);
            }
        }, 15000);
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = BlockchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [realtime_gateway_1.RealtimeGateway,
        price_service_1.PriceService])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map