import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AlertsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: Prisma.AlertCreateWithoutUserInput) {
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
