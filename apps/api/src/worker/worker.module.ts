import { Module } from '@nestjs/common';
import { AlertCheckerService } from './alert-checker.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceModule } from '../price/price.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
    imports: [PrismaModule, PriceModule, TelegramModule],
    providers: [AlertCheckerService],
    exports: [AlertCheckerService],
})
export class WorkerModule { }
