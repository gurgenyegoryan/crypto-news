import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WalletsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: Prisma.WalletCreateWithoutUserInput) {
        return this.prisma.wallet.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.wallet.findMany({
            where: { userId },
        });
    }

    async remove(id: string, userId: string) {
        return this.prisma.wallet.deleteMany({
            where: { id, userId },
        });
    }
}
