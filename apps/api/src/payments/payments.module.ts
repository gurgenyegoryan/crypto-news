import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SubscriptionReminderService } from './subscription-reminder.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
    imports: [PrismaModule, TelegramModule],
    controllers: [PaymentsController],
    providers: [PaymentsService, SubscriptionReminderService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
