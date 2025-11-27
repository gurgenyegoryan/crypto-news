import { Injectable, Logger } from '@nestjs/common';
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
    private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 30000; // 30 seconds

    constructor(private realtimeGateway: RealtimeGateway) {
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

        // Check cache first
        const cached = this.priceCache.get(tokenUpper);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.price;
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
                this.priceCache.set(tokenUpper, { price, timestamp: Date.now() });
                return price;
            }

            this.logger.warn(`Price not found for token: ${token}`);
            return null;
        } catch (error) {
            this.logger.error(`Error fetching price for ${token}: ${error.message}`);

            // Return cached value if available, even if expired
            if (cached) {
                this.logger.log(`Using stale cache for ${tokenUpper}`);
                return cached.price;
            }

            return null;
        }
    }

    /**
     * Fetch prices for multiple tokens in a single API call (more efficient)
     */
    async getPrices(tokens: string[]): Promise<Map<string, number>> {
        const prices = new Map<string, number>();

        try {
            // Convert token symbols to CoinGecko IDs
            const coinIds = tokens.map(token => {
                const tokenUpper = token.toUpperCase();
                return this.tokenMap[tokenUpper] || token.toLowerCase();
            });

            // Batch request - all tokens in one API call
            const response = await axios.get<CoinPrice>(this.coingeckoUrl, {
                params: {
                    ids: coinIds.join(','),
                    vs_currencies: 'usd',
                    include_24hr_change: 'true',
                },
                timeout: 10000,
            });

            // Map results back to token symbols
            tokens.forEach((token, index) => {
                const tokenUpper = token.toUpperCase();
                const coinId = coinIds[index];

                if (response.data[coinId]?.usd) {
                    const price = response.data[coinId].usd;
                    prices.set(tokenUpper, price);
                    this.priceCache.set(tokenUpper, { price, timestamp: Date.now() });
                }
            });

            this.logger.log(`Fetched ${prices.size}/${tokens.length} prices successfully`);
        } catch (error) {
            this.logger.error(`Error fetching batch prices: ${error.message}`);

            // Fallback to cache for all tokens
            tokens.forEach(token => {
                const tokenUpper = token.toUpperCase();
                const cached = this.priceCache.get(tokenUpper);
                if (cached) {
                    prices.set(tokenUpper, cached.price);
                }
            });

            if (prices.size > 0) {
                this.logger.log(`Using cached prices for ${prices.size} tokens`);
            }
        }

        return prices;
    }

    /**
     * Start periodic price updates for popular tokens
     */
    private startPriceUpdates() {
        const popularTokens = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

        // Update every 60 seconds to respect CoinGecko free tier limits (50 calls/min)
        setInterval(async () => {
            try {
                const prices = await this.getPrices(popularTokens);

                prices.forEach((price, token) => {
                    this.realtimeGateway.broadcastTickerUpdate(token, {
                        token,
                        price,
                        change24h: 0, // Could be calculated from cached data
                        timestamp: Date.now()
                    });
                });
            } catch (error) {
                this.logger.error('Error in price update loop:', error);
            }
        }, 60000); // Changed from 10s to 60s
    }
}
