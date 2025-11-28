import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceService } from '../price/price.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class AlertCheckerService {
    private readonly logger = new Logger(AlertCheckerService.name);

    constructor(
        private prisma: PrismaService,
        private priceService: PriceService,
        private telegramService: TelegramService,
    ) { }

    async checkAlerts(): Promise<void> {
        try {
            // Get all active alerts with user information
            const alerts = await this.prisma.alert.findMany({
                where: { isActive: true },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            telegramId: true,
                        },
                    },
                },
            });

            if (alerts.length === 0) {
                this.logger.log('No active alerts to check');
                return;
            }

            this.logger.log(`Checking ${alerts.length} active alerts`);

            // Get unique tokens
            const tokens = [...new Set(alerts.map(alert => alert.token))];

            // Fetch prices for all tokens
            const prices = await this.priceService.getPrices(tokens);

            // Check each alert
            for (const alert of alerts) {
                const currentPrice = prices.get(alert.token.toUpperCase());

                if (currentPrice === undefined) {
                    this.logger.warn(`Could not get price for ${alert.token}, skipping alert ${alert.id}`);
                    continue;
                }

                let shouldTrigger = false;
                const targetPrice = parseFloat(alert.price.toString());
                const priceValue = typeof currentPrice === 'number' ? currentPrice : currentPrice.price;

                // Check if alert should trigger based on type
                if (alert.type === 'above' && priceValue >= targetPrice) {
                    shouldTrigger = true;
                } else if (alert.type === 'below' && priceValue <= targetPrice) {
                    shouldTrigger = true;
                }

                if (shouldTrigger) {
                    this.logger.log(
                        `Alert ${alert.id} triggered: ${alert.token} is ${alert.type} ${targetPrice} (current: ${priceValue})`
                    );

                    // Send Telegram notification if user has telegram ID
                    if (alert.user.telegramId) {
                        await this.telegramService.sendPriceAlert(
                            alert.user.telegramId,
                            alert.token,
                            priceValue,
                            targetPrice,
                            alert.type
                        );
                    } else {
                        this.logger.warn(`User ${alert.user.email} has no Telegram ID, cannot send notification`);
                    }

                    // Deactivate the alert so it doesn't trigger again
                    await this.prisma.alert.update({
                        where: { id: alert.id },
                        data: { isActive: false },
                    });

                    this.logger.log(`Alert ${alert.id} deactivated after triggering`);
                }
            }
        } catch (error) {
            this.logger.error(`Error checking alerts: ${error.message}`, error.stack);
        }
    }
}
