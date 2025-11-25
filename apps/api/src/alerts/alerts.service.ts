import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AlertsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: Prisma.AlertCreateWithoutUserInput) {
        // Enforce non-premium limit: only one alert allowed for free users
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.tier !== 'premium') {
            const existingCount = await this.prisma.alert.count({ where: { userId } });
            if (existingCount >= 1) {
                throw new Error('Free tier limit reached. Please upgrade to Premium to create more alerts.');
            }
        }

        return this.prisma.alert.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.alert.findMany({
            where: { userId },
        });
    }

    async remove(id: string, userId: string) {
        return this.prisma.alert.deleteMany({
            where: { id, userId },
        });
    }
}
