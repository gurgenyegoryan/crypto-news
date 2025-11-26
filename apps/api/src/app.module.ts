import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
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

// Premium features
import { BlockchainModule } from './blockchain/blockchain.module';
import { SentimentModule } from './sentiment/sentiment.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { SecurityModule } from './security/security.module';
import { CopyTradingModule } from './copy-trading/copy-trading.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enable cron jobs
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
    // Premium features
    BlockchainModule,
    SentimentModule,
    PortfolioModule,
    SecurityModule,
    CopyTradingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
