import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { AlertCheckerService } from './worker/alert-checker.service';
import { PaymentsService } from './payments/payments.service';
import { SentimentService } from './sentiment/sentiment.service';

async function bootstrap() {
    const logger = new Logger('Worker');
    logger.log('Starting CryptoMonitor Worker Service...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const alertChecker = app.get(AlertCheckerService);
    const paymentsService = app.get(PaymentsService);
    const sentimentService = app.get(SentimentService);

    // Check alerts every 30 seconds
    const ALERT_CHECK_INTERVAL = 30 * 1000; // 30 seconds

    // Check subscriptions once per day (24 hours)
    const SUBSCRIPTION_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

    // Analyze sentiment every 1 hour
    const SENTIMENT_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

    logger.log(`Worker started.`);
    logger.log(`- Checking alerts every ${ALERT_CHECK_INTERVAL / 1000} seconds`);
    logger.log(`- Checking subscriptions every ${SUBSCRIPTION_CHECK_INTERVAL / (1000 * 60 * 60)} hours`);
    logger.log(`- Analyzing sentiment every ${SENTIMENT_CHECK_INTERVAL / (1000 * 60)} minutes`);

    // Run alert checker immediately on startup
    await alertChecker.checkAlerts();

    // Run subscription checker immediately on startup
    await paymentsService.checkExpiredSubscriptions();

    // Run sentiment analysis immediately on startup (async)
    sentimentService.analyzePopularTokens().catch(err => logger.error('Error analyzing sentiment:', err));

    // Then run alert checker on interval
    setInterval(async () => {
        await alertChecker.checkAlerts();
    }, ALERT_CHECK_INTERVAL);

    // Run subscription checker daily
    setInterval(async () => {
        await paymentsService.checkExpiredSubscriptions();
    }, SUBSCRIPTION_CHECK_INTERVAL);

    // Run sentiment analysis hourly
    setInterval(async () => {
        await sentimentService.analyzePopularTokens();
    }, SENTIMENT_CHECK_INTERVAL);
}

bootstrap().catch((error) => {
    console.error('Failed to start worker:', error);
    process.exit(1);
});
