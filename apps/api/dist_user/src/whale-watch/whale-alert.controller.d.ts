import { WhaleAlertService } from './whale-alert.service';
export declare class WhaleAlertController {
    private whaleAlertService;
    constructor(whaleAlertService: WhaleAlertService);
    getUserAlerts(req: any): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        chain: string;
        userId: string;
        walletAddress: string;
        walletLabel: string | null;
        minAmount: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createAlert(req: any, body: {
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
    deleteAlert(req: any, id: string): Promise<{
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
