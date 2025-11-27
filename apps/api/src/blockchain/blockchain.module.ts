import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { PriceModule } from '../price/price.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [PriceModule, RealtimeModule],
    providers: [BlockchainService],
    exports: [BlockchainService],
})
export class BlockchainModule { }
