import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [RealtimeModule],
    providers: [PriceService],
    exports: [PriceService],
})
export class PriceModule { }
