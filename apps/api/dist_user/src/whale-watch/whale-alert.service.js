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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhaleAlertService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WhaleAlertService = class WhaleAlertService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserAlerts(userId) {
        return this.prisma.whaleAlert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createAlert(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.tier === 'free') {
            const alertCount = await this.prisma.whaleAlert.count({ where: { userId } });
            if (alertCount >= 1) {
                throw new Error('Free tier limited to 1 whale alert. Please upgrade to Premium.');
            }
        }
        return this.prisma.whaleAlert.create({
            data: {
                userId,
                walletAddress: data.walletAddress.toLowerCase(),
                walletLabel: data.walletLabel,
                chain: data.chain,
                minAmount: data.minAmount,
                active: true,
            },
        });
    }
    async deleteAlert(userId, alertId) {
        const alert = await this.prisma.whaleAlert.findFirst({
            where: { id: alertId, userId },
        });
        if (!alert) {
            throw new Error('Alert not found');
        }
        return this.prisma.whaleAlert.delete({
            where: { id: alertId },
        });
    }
    async toggleAlert(userId, alertId) {
        const alert = await this.prisma.whaleAlert.findFirst({
            where: { id: alertId, userId },
        });
        if (!alert) {
            throw new Error('Alert not found');
        }
        return this.prisma.whaleAlert.update({
            where: { id: alertId },
            data: { active: !alert.active },
        });
    }
};
exports.WhaleAlertService = WhaleAlertService;
exports.WhaleAlertService = WhaleAlertService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhaleAlertService);
//# sourceMappingURL=whale-alert.service.js.map