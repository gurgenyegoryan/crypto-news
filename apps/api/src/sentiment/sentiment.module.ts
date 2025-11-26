import { Module } from '@nestjs/common';
import { SentimentController } from './sentiment.controller';
import { SentimentService } from './sentiment.service';
import { SentimentCronService } from './sentiment.cron';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SentimentController],
    providers: [SentimentService, SentimentCronService],
    exports: [SentimentService],
})
export class SentimentModule { }
