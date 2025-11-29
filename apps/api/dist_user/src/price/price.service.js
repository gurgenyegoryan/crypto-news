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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PriceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const axios_1 = __importDefault(require("axios"));
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let PriceService = PriceService_1 = class PriceService {
    cacheManager;
    realtimeGateway;
    logger = new common_1.Logger(PriceService_1.name);
    coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price';
    CACHE_TTL = 60000;
    constructor(cacheManager, realtimeGateway) {
        this.cacheManager = cacheManager;
        this.realtimeGateway = realtimeGateway;
        this.startPriceUpdates();
    }
    tokenMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDT': 'tether',
        'BNB': 'binancecoin',
        'SOL': 'solana',
        'XRP': 'ripple',
        'USDC': 'usd-coin',
        'ADA': 'cardano',
        'DOGE': 'dogecoin',
        'TRX': 'tron',
        'AVAX': 'avalanche-2',
        'DOT': 'polkadot',
        'MATIC': 'matic-network',
        'LTC': 'litecoin',
        'LINK': 'chainlink',
    };
    async getPrice(token) {
        const tokenUpper = token.toUpperCase();
        const cacheKey = `price:${tokenUpper}`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            return cachedData.price;
        }
        try {
            const coinId = this.tokenMap[tokenUpper] || token.toLowerCase();
            const response = await axios_1.default.get(this.coingeckoUrl, {
                params: {
                    ids: coinId,
                    vs_currencies: 'usd',
                    include_24hr_change: 'true',
                },
                timeout: 5000,
            });
            if (response.data[coinId]?.usd) {
                const price = response.data[coinId].usd;
                const change24h = response.data[coinId].usd_24h_change || 0;
                await this.cacheManager.set(cacheKey, { price, change24h }, 60000);
                return price;
            }
            this.logger.warn(`Price not found for token: ${token}`);
            return null;
        }
        catch (error) {
            this.logger.error(`Error fetching price for ${token}: ${error.message}`);
            return null;
        }
    }
    async getPrices(tokens) {
        const prices = new Map();
        const tokensToFetch = [];
        await Promise.all(tokens.map(async (token) => {
            const tokenUpper = token.toUpperCase();
            const cacheKey = `price:${tokenUpper}`;
            const cachedData = await this.cacheManager.get(cacheKey);
            if (cachedData) {
                prices.set(tokenUpper, cachedData);
            }
            else {
                tokensToFetch.push(token);
            }
        }));
        if (tokensToFetch.length === 0) {
            this.logger.log(`Using cached prices for all ${tokens.length} tokens`);
            return prices;
        }
        try {
            const coinIds = tokensToFetch.map(token => {
                const tokenUpper = token.toUpperCase();
                return this.tokenMap[tokenUpper] || token.toLowerCase();
            });
            const response = await axios_1.default.get(this.coingeckoUrl, {
                params: {
                    ids: coinIds.join(','),
                    vs_currencies: 'usd',
                    include_24hr_change: 'true',
                },
                timeout: 10000,
            });
            tokensToFetch.forEach((token, index) => {
                const tokenUpper = token.toUpperCase();
                const coinId = coinIds[index];
                if (response.data[coinId]?.usd) {
                    const price = response.data[coinId].usd;
                    const change24h = response.data[coinId].usd_24h_change || 0;
                    const data = { price, change24h };
                    prices.set(tokenUpper, data);
                    this.cacheManager.set(`price:${tokenUpper}`, data, 60000);
                }
            });
            this.logger.log(`Fetched ${tokensToFetch.length} new prices, used ${tokens.length - tokensToFetch.length} cached`);
        }
        catch (error) {
            this.logger.error(`Error fetching batch prices: ${error.message}`);
        }
        return prices;
    }
    startPriceUpdates() {
        const popularTokens = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];
        const broadcastPrices = async () => {
            try {
                const prices = await this.getPrices(popularTokens);
                prices.forEach((data, token) => {
                    this.realtimeGateway.broadcastTickerUpdate(token, {
                        token,
                        price: data.price,
                        change24h: data.change24h,
                        timestamp: Date.now()
                    });
                });
                this.logger.log(`Broadcasted prices for ${prices.size} tokens`);
            }
            catch (error) {
                this.logger.error('Error in price update loop:', error);
            }
        };
        broadcastPrices();
        setInterval(broadcastPrices, 10000);
    }
};
exports.PriceService = PriceService;
exports.PriceService = PriceService = PriceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, realtime_gateway_1.RealtimeGateway])
], PriceService);
//# sourceMappingURL=price.service.js.map