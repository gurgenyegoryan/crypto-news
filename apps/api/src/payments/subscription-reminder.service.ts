import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionReminderService {
    private readonly logger = new Logger(SubscriptionReminderService.name);

    constructor(
        private prisma: PrismaService,
        private telegramService: TelegramService,
    ) { }

    /**
     * Check for expiring subscriptions and send reminders
     * Runs daily at 10:00 AM
     */
    @Cron(CronExpression.EVERY_DAY_AT_10AM)
    async checkAndSendReminders() {
        this.logger.log('Checking for expiring subscriptions...');

        const now = new Date();
        const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
        const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

        // Find users expiring in 5 days
        await this.sendReminders(now, in5Days, 5);

        // Find users expiring in 2 days
        await this.sendReminders(now, in2Days, 2);

        // Find users expiring in 1 day
        await this.sendReminders(now, in1Day, 1);

        // Find users expiring today
        await this.sendExpiryNotifications();
    }

    private async sendReminders(startDate: Date, endDate: Date, daysRemaining: number) {
        const users = await this.prisma.user.findMany({
            where: {
                subscriptionStatus: 'active',
                tier: 'premium',
                premiumUntil: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        this.logger.log(`Found ${users.length} users with ${daysRemaining} days remaining`);

        for (const user of users) {
            try {
                // Send Telegram notification if user has Telegram configured
                if (user.telegramId && user.premiumUntil) {
                    const message = this.getReminderMessage(daysRemaining, user.premiumUntil);
                    await this.telegramService.sendMessage(user.telegramId, message);
                    this.logger.log(`Sent ${daysRemaining}-day reminder to ${user.email}`);
                }

                // TODO: Send email notification as well
                // await this.emailService.sendExpiryReminder(user.email, daysRemaining);
            } catch (error) {
                this.logger.error(`Failed to send reminder to ${user.email}: ${error.message}`);
            }
        }
    }

    private async sendExpiryNotifications() {
        const now = new Date();
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        const users = await this.prisma.user.findMany({
            where: {
                subscriptionStatus: 'active',
                tier: 'premium',
                premiumUntil: {
                    lte: endOfToday,
                },
            },
        });

        this.logger.log(`Found ${users.length} users expiring today`);

        for (const user of users) {
            try {
                if (user.telegramId) {
                    const message = `🔴 *Subscription Expired*\n\n` +
                        `Your premium subscription has expired.\n\n` +
                        `To continue enjoying premium features:\n` +
                        `• Real-time whale alerts\n` +
                        `• Advanced security scanner\n` +
                        `• Portfolio tracking\n` +
                        `• Copy trading\n\n` +
                        `Please renew your subscription in the dashboard.`;

                    await this.telegramService.sendMessage(user.telegramId, message);
                    this.logger.log(`Sent expiry notification to ${user.email}`);
                }
            } catch (error) {
                this.logger.error(`Failed to send expiry notification to ${user.email}: ${error.message}`);
            }
        }
    }

    private getReminderMessage(daysRemaining: number, expiryDate: Date): string {
        const emoji = daysRemaining === 5 ? '⚠️' : daysRemaining === 2 ? '⏰' : '🔔';

        return `${emoji} *Subscription Expiring Soon*\n\n` +
            `Your premium subscription will expire in *${daysRemaining} day${daysRemaining > 1 ? 's' : ''}*.\n\n` +
            `Expiry Date: ${expiryDate.toLocaleDateString()}\n\n` +
            `Renew now to continue enjoying:\n` +
            `• Real-time whale alerts\n` +
            `• Advanced security scanner\n` +
            `• Portfolio tracking\n` +
            `• Copy trading\n\n` +
            `Visit your dashboard to renew.`;
    }
}
