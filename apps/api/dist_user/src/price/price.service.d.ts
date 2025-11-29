import type { Cache } from 'cache-manager';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class PriceService {
    private cacheManager;
    private realtimeGateway;
    private readonly logger;
    private readonly coingeckoUrl;
    private readonly CACHE_TTL;
    constructor(cacheManager: Cache, realtimeGateway: RealtimeGateway);
    private readonly tokenMap;
    getPrice(token: string): Promise<number | null>;
    getPrices(tokens: string[]): Promise<Map<string, {
        price: number;
        change24h: number;
    }>>;
    private startPriceUpdates;
}
