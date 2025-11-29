"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const alert_checker_service_1 = require("./worker/alert-checker.service");
const payments_service_1 = require("./payments/payments.service");
const sentiment_service_1 = require("./sentiment/sentiment.service");
async function bootstrap() {
    const logger = new common_1.Logger('Worker');
    logger.log('Starting CryptoMonitor Worker Service...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const alertChecker = app.get(alert_checker_service_1.AlertCheckerService);
    const paymentsService = app.get(payments_service_1.PaymentsService);
    const sentimentService = app.get(sentiment_service_1.SentimentService);
    const ALERT_CHECK_INTERVAL = 30 * 1000;
    const SUBSCRIPTION_CHECK_INTERVAL = 24 * 60 * 60 * 1000;
    const SENTIMENT_CHECK_INTERVAL = 60 * 60 * 1000;
    logger.log(`Worker started.`);
    logger.log(`- Checking alerts every ${ALERT_CHECK_INTERVAL / 1000} seconds`);
    logger.log(`- Checking subscriptions every ${SUBSCRIPTION_CHECK_INTERVAL / (1000 * 60 * 60)} hours`);
    logger.log(`- Analyzing sentiment every ${SENTIMENT_CHECK_INTERVAL / (1000 * 60)} minutes`);
    await alertChecker.checkAlerts();
    await paymentsService.checkExpiredSubscriptions();
    sentimentService.analyzePopularTokens().catch(err => logger.error('Error analyzing sentiment:', err));
    setInterval(async () => {
        await alertChecker.checkAlerts();
    }, ALERT_CHECK_INTERVAL);
    setInterval(async () => {
        await paymentsService.checkExpiredSubscriptions();
    }, SUBSCRIPTION_CHECK_INTERVAL);
    setInterval(async () => {
        await sentimentService.analyzePopularTokens();
    }, SENTIMENT_CHECK_INTERVAL);
}
bootstrap().catch((error) => {
    console.error('Failed to start worker:', error);
    process.exit(1);
});
//# sourceMappingURL=worker.js.map