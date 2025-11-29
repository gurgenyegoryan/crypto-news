import { PrismaService } from '../prisma/prisma.service';
export declare class WhaleAlertService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserAlerts(userId: string): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        chain: string;
        userId: string;
        walletAddress: string;
        walletLabel: string | null;
        minAmount: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createAlert(userId: string, data: {
        walletAddress: string;
        walletLabel?: string;
        chain: string;
        minAmount: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        chain: string;
        userId: string;
        walletAddress: string;
        walletLabel: string | null;
        minAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteAlert(userId: string, alertId: string): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        chain: string;
        userId: string;
        walletAddress: string;
        walletLabel: string | null;
        minAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    toggleAlert(userId: string, alertId: string): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        chain: string;
        userId: string;
        walletAddress: string;
        walletLabel: string | null;
        minAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
}
