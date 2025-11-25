import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface CoinPrice {
    [key: string]: {
        usd: number;
    };
}

@Injectable()
export class PriceService {
    private readonly logger = new Logger(PriceService.name);
    private readonly coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price';

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
        try {
            const tokenUpper = token.toUpperCase();
            const coinId = this.tokenMap[tokenUpper] || token.toLowerCase();

            const response = await axios.get<CoinPrice>(this.coingeckoUrl, {
                params: {
                    ids: coinId,
                    vs_currencies: 'usd',
                },
            });

            if (response.data[coinId]?.usd) {
                const price = response.data[coinId].usd;
                this.logger.log(`Fetched price for ${tokenUpper}: $${price}`);
                return price;
            }

            this.logger.warn(`Price not found for token: ${token}`);
            return null;
        } catch (error) {
            this.logger.error(`Error fetching price for ${token}: ${error.message}`);
            return null;
        }
    }

    async getPrices(tokens: string[]): Promise<Map<string, number>> {
        const prices = new Map<string, number>();

        for (const token of tokens) {
            const price = await this.getPrice(token);
            if (price !== null) {
                prices.set(token.toUpperCase(), price);
            }
        }

        return prices;
    }
}
