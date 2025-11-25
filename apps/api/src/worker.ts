import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { AlertCheckerService } from './worker/alert-checker.service';

async function bootstrap() {
    const logger = new Logger('Worker');
    logger.log('Starting CryptoMonitor Worker Service...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const alertChecker = app.get(AlertCheckerService);

    // Check alerts every 30 seconds
    const CHECK_INTERVAL = 30 * 1000; // 30 seconds

    logger.log(`Worker started. Checking alerts every ${CHECK_INTERVAL / 1000} seconds`);

    // Run immediately on startup
    await alertChecker.checkAlerts();

    // Then run on interval
    setInterval(async () => {
        await alertChecker.checkAlerts();
    }, CHECK_INTERVAL);
}

bootstrap().catch((error) => {
    console.error('Failed to start worker:', error);
    process.exit(1);
});
