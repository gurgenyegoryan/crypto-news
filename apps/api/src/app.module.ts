import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { AlertsModule } from './alerts/alerts.module';
import { EmailModule } from './email/email.module';
import { WorkerModule } from './worker/worker.module';
import { PriceModule } from './price/price.module';
import { TelegramModule } from './telegram/telegram.module';
import { WhaleWatchModule } from './whale-watch/whale-watch.module';
import { PaymentsModule } from './payments/payments.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    AlertsModule,
    EmailModule,
    WorkerModule,
    PriceModule,
    TelegramModule,
    WhaleWatchModule,
    PaymentsModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
