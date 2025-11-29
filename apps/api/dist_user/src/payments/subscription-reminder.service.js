"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SubscriptionReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionReminderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("../telegram/telegram.service");
const email_service_1 = require("../email/email.service");
const schedule_1 = require("@nestjs/schedule");
let SubscriptionReminderService = SubscriptionReminderService_1 = class SubscriptionReminderService {
    prisma;
    telegramService;
    emailService;
    logger = new common_1.Logger(SubscriptionReminderService_1.name);
    constructor(prisma, telegramService, emailService) {
        this.prisma = prisma;
        this.telegramService = telegramService;
        this.emailService = emailService;
    }
    async checkAndSendReminders() {
        this.logger.log('Checking for expiring subscriptions...');
        const now = new Date();
        const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
        const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
        await this.sendReminders(now, in5Days, 5);
        await this.sendReminders(now, in2Days, 2);
        await this.sendReminders(now, in1Day, 1);
        await this.sendExpiryNotifications();
    }
    async sendReminders(startDate, endDate, daysRemaining) {
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
                if (user.telegramId && user.premiumUntil) {
                    const message = this.getReminderMessage(daysRemaining, user.premiumUntil);
                    await this.telegramService.sendMessage(user.telegramId, message);
                    this.logger.log(`Sent ${daysRemaining}-day reminder to ${user.email}`);
                }
                if (user.emailAlerts) {
                    await this.emailService.sendExpiryReminder(user.email, daysRemaining);
                }
            }
            catch (error) {
                this.logger.error(`Failed to send reminder to ${user.email}: ${error.message}`);
            }
        }
    }
    async sendExpiryNotifications() {
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
            }
            catch (error) {
                this.logger.error(`Failed to send expiry notification to ${user.email}: ${error.message}`);
            }
        }
    }
    getReminderMessage(daysRemaining, expiryDate) {
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
};
exports.SubscriptionReminderService = SubscriptionReminderService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_10AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionReminderService.prototype, "checkAndSendReminders", null);
exports.SubscriptionReminderService = SubscriptionReminderService = SubscriptionReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService,
        email_service_1.EmailService])
], SubscriptionReminderService);
//# sourceMappingURL=subscription-reminder.service.js.map