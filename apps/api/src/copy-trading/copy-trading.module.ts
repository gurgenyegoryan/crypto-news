import { Module } from '@nestjs/common';
import { CopyTradingController } from './copy-trading.controller';
import { CopyTradingService } from './copy-trading.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CopyTradingController],
    providers: [CopyTradingService],
    exports: [CopyTradingService],
})
export class CopyTradingModule { }
