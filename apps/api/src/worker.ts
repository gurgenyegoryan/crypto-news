import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { AlertCheckerService } from './worker/alert-checker.service';
import { PaymentsService } from './payments/payments.service';

async function bootstrap() {
    const logger = new Logger('Worker');
    logger.log('Starting CryptoMonitor Worker Service...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const alertChecker = app.get(AlertCheckerService);
    const paymentsService = app.get(PaymentsService);

    // Check alerts every 30 seconds
    const ALERT_CHECK_INTERVAL = 30 * 1000; // 30 seconds

    // Check subscriptions once per day (24 hours)
    const SUBSCRIPTION_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

    logger.log(`Worker started.`);
    logger.log(`- Checking alerts every ${ALERT_CHECK_INTERVAL / 1000} seconds`);
    logger.log(`- Checking subscriptions every ${SUBSCRIPTION_CHECK_INTERVAL / (1000 * 60 * 60)} hours`);

    // Run alert checker immediately on startup
    await alertChecker.checkAlerts();

    // Run subscription checker immediately on startup
    await paymentsService.checkExpiredSubscriptions();

    // Then run alert checker on interval
    setInterval(async () => {
        await alertChecker.checkAlerts();
    }, ALERT_CHECK_INTERVAL);

    // Run subscription checker daily
    setInterval(async () => {
        await paymentsService.checkExpiredSubscriptions();
    }, SUBSCRIPTION_CHECK_INTERVAL);
}

bootstrap().catch((error) => {
    console.error('Failed to start worker:', error);
    process.exit(1);
});
