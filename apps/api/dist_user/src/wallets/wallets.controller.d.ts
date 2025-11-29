import { WalletsService } from './wallets.service';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    create(req: any, createWalletDto: {
        address: string;
        chain: string;
        label?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        address: string;
        chain: string;
        label: string | null;
        userId: string;
    }>;
    findAll(req: any): Promise<{
        balance: string;
        id: string;
        createdAt: Date;
        address: string;
        chain: string;
        label: string | null;
        userId: string;
    }[]>;
    remove(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
