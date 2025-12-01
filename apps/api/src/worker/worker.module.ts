import { Module } from '@nestjs/common';
import { AlertCheckerService } from './alert-checker.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceModule } from '../price/price.module';
import { TelegramModule } from '../telegram/telegram.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [PrismaModule, PriceModule, TelegramModule, EmailModule],
    providers: [AlertCheckerService],
    exports: [AlertCheckerService],
})
export class WorkerModule { }
