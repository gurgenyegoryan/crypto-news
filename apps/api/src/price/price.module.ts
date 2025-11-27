import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PriceService } from './price.service';
import { RealtimeModule } from '../realtime/realtime.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
    imports: [
        RealtimeModule,
        CacheModule.register({
            store: redisStore,
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            ttl: 60, // 60 seconds default TTL
        }),
    ],
    providers: [PriceService],
    exports: [PriceService],
})
export class PriceModule { }
