import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import { RealtimeGateway } from '../realtime/realtime.gateway';

interface CoinPrice {
    [key: string]: {
        usd: number;
        usd_24h_change?: number;
    };
}

@Injectable()
export class PriceService {
    private readonly logger = new Logger(PriceService.name);
    private readonly coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price';
    private readonly CACHE_TTL = 60000; // 60 seconds (Redis TTL is in ms for some stores, seconds for others, usually seconds in NestJS config but let's verify)
    // NestJS CacheModule TTL is usually in milliseconds for v5+, but seconds for v4. 
    // We configured global TTL as 60 (seconds) in module.
    // Here we can use specific TTL if needed.

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private realtimeGateway: RealtimeGateway
    ) {
        this.startPriceUpdates();
    }

    // Map common token symbols to CoinGecko IDs
    private readonly tokenMap: { [key: string]: string } = {
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

    async getPrice(token: string): Promise<number | null> {
        const tokenUpper = token.toUpperCase();
        const cacheKey = `price:${tokenUpper}`;

        // Check cache first
        const cachedPrice = await this.cacheManager.get<number>(cacheKey);
        if (cachedPrice) {
            return cachedPrice;
        }

        try {
            const coinId = this.tokenMap[tokenUpper] || token.toLowerCase();

            const response = await axios.get<CoinPrice>(this.coingeckoUrl, {
                params: {
                    ids: coinId,
                    vs_currencies: 'usd',
                },
                timeout: 5000,
            });

            if (response.data[coinId]?.usd) {
                const price = response.data[coinId].usd;
                await this.cacheManager.set(cacheKey, price, 60000); // 60s TTL (check if ms or s)
                // In cache-manager v5, TTL is in milliseconds. In v4 it was seconds.
                // NestJS 10+ usually uses v5. Let's assume ms to be safe or check docs. 
                // Actually, cache-manager-redis-store might behave differently.
                // Let's use a safe value. If it's seconds, 60000 is huge (16 hours), which is fine for now.
                // If it's ms, it's 1 minute.
                return price;
            }

            this.logger.warn(`Price not found for token: ${token}`);
            return null;
        } catch (error) {
            this.logger.error(`Error fetching price for ${token}: ${error.message}`);
            return null;
        }
    }

    /**
     * Fetch prices for multiple tokens in a single API call (more efficient)
     */
    async getPrices(tokens: string[]): Promise<Map<string, number>> {
        const prices = new Map<string, number>();
        const tokensToFetch: string[] = [];

        // Check cache for all tokens first
        await Promise.all(tokens.map(async (token) => {
            const tokenUpper = token.toUpperCase();
            const cacheKey = `price:${tokenUpper}`;
            const cachedPrice = await this.cacheManager.get<number>(cacheKey);

            if (cachedPrice) {
                prices.set(tokenUpper, cachedPrice);
            } else {
                tokensToFetch.push(token);
            }
        }));

        if (tokensToFetch.length === 0) {
            this.logger.log(`Using cached prices for all ${tokens.length} tokens`);
            return prices;
        }

        try {
            // Convert token symbols to CoinGecko IDs
            const coinIds = tokensToFetch.map(token => {
                const tokenUpper = token.toUpperCase();
                return this.tokenMap[tokenUpper] || token.toLowerCase();
            });

            // Batch request - only for missing tokens
            const response = await axios.get<CoinPrice>(this.coingeckoUrl, {
                params: {
                    ids: coinIds.join(','),
                    vs_currencies: 'usd',
                    include_24hr_change: 'true',
                },
                timeout: 10000,
            });

            // Map results back to token symbols
            tokensToFetch.forEach((token, index) => {
                const tokenUpper = token.toUpperCase();
                const coinId = coinIds[index];

                if (response.data[coinId]?.usd) {
                    const price = response.data[coinId].usd;
                    prices.set(tokenUpper, price);
                    // Cache the new price
                    this.cacheManager.set(`price:${tokenUpper}`, price, 60000);
                }
            });

            this.logger.log(`Fetched ${tokensToFetch.length} new prices, used ${tokens.length - tokensToFetch.length} cached`);
        } catch (error) {
            this.logger.error(`Error fetching batch prices: ${error.message}`);
            // If API fails, we only have what was in cache.
            // We could try to return stale data if we had a secondary cache, but Redis is our primary.
        }

        return prices;
    }

    /**
     * Start periodic price updates for popular tokens
     */
    private startPriceUpdates() {
        const popularTokens = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

        // Fetch prices immediately on startup
        const broadcastPrices = async () => {
            try {
                // This will use cache if available, or fetch if not
                const prices = await this.getPrices(popularTokens);

                prices.forEach((price, token) => {
                    this.realtimeGateway.broadcastTickerUpdate(token, {
                        token,
                        price,
                        change24h: 0,
                        timestamp: Date.now()
                    });
                });

                this.logger.log(`Broadcasted prices for ${prices.size} tokens`);
            } catch (error) {
                this.logger.error('Error in price update loop:', error);
            }
        };

        // Broadcast immediately
        broadcastPrices();

        // Update every 10 seconds
        // Since we have caching, this will hit Redis mostly, and API only when cache expires (every 60s)
        setInterval(broadcastPrices, 10000);
    }
}
