import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SentimentService } from './sentiment.service';

@Injectable()
export class SentimentCronService {
    constructor(private sentimentService: SentimentService) { }

    /**
     * Run sentiment analysis every hour
     */
    @Cron(CronExpression.EVERY_HOUR)
    async analyzeSentiment() {
        console.log('[SentimentCron] Starting hourly sentiment analysis...');
        try {
            await this.sentimentService.analyzePopularTokens();
            console.log('[SentimentCron] Sentiment analysis completed');
        } catch (error) {
            console.error('[SentimentCron] Error during sentiment analysis:', error);
        }
    }
}
