import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhaleAlertService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all whale alerts for a user
     */
    async getUserAlerts(userId: string) {
        return this.prisma.whaleAlert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Create a new whale alert
     */
    async createAlert(userId: string, data: {
        walletAddress: string;
        walletLabel?: string;
        chain: string;
        minAmount: number;
    }) {
        // Check user tier limits
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

    /**
     * Delete a whale alert
     */
    async deleteAlert(userId: string, alertId: string) {
        // Ensure user owns this alert
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

    /**
     * Toggle alert active status
     */
    async toggleAlert(userId: string, alertId: string) {
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
}
