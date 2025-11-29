import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AlertsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: Prisma.AlertCreateWithoutUserInput): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        token: string;
        price: Prisma.Decimal;
        isActive: boolean;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        token: string;
        price: Prisma.Decimal;
        isActive: boolean;
    }[]>;
    remove(id: string, userId: string): Promise<Prisma.BatchPayload>;
}
