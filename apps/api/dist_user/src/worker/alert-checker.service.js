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
var AlertCheckerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertCheckerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const price_service_1 = require("../price/price.service");
const telegram_service_1 = require("../telegram/telegram.service");
let AlertCheckerService = AlertCheckerService_1 = class AlertCheckerService {
    prisma;
    priceService;
    telegramService;
    logger = new common_1.Logger(AlertCheckerService_1.name);
    constructor(prisma, priceService, telegramService) {
        this.prisma = prisma;
        this.priceService = priceService;
        this.telegramService = telegramService;
    }
    async checkAlerts() {
        try {
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
            const tokens = [...new Set(alerts.map(alert => alert.token))];
            const prices = await this.priceService.getPrices(tokens);
            for (const alert of alerts) {
                const currentPrice = prices.get(alert.token.toUpperCase());
                if (currentPrice === undefined) {
                    this.logger.warn(`Could not get price for ${alert.token}, skipping alert ${alert.id}`);
                    continue;
                }
                let shouldTrigger = false;
                const targetPrice = parseFloat(alert.price.toString());
                const priceValue = typeof currentPrice === 'number' ? currentPrice : currentPrice.price;
                if (alert.type === 'above' && priceValue >= targetPrice) {
                    shouldTrigger = true;
                }
                else if (alert.type === 'below' && priceValue <= targetPrice) {
                    shouldTrigger = true;
                }
                if (shouldTrigger) {
                    this.logger.log(`Alert ${alert.id} triggered: ${alert.token} is ${alert.type} ${targetPrice} (current: ${priceValue})`);
                    if (alert.user.telegramId) {
                        await this.telegramService.sendPriceAlert(alert.user.telegramId, alert.token, priceValue, targetPrice, alert.type);
                    }
                    else {
                        this.logger.warn(`User ${alert.user.email} has no Telegram ID, cannot send notification`);
                    }
                    await this.prisma.alert.update({
                        where: { id: alert.id },
                        data: { isActive: false },
                    });
                    this.logger.log(`Alert ${alert.id} deactivated after triggering`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error checking alerts: ${error.message}`, error.stack);
        }
    }
};
exports.AlertCheckerService = AlertCheckerService;
exports.AlertCheckerService = AlertCheckerService = AlertCheckerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        price_service_1.PriceService,
        telegram_service_1.TelegramService])
], AlertCheckerService);
//# sourceMappingURL=alert-checker.service.js.map