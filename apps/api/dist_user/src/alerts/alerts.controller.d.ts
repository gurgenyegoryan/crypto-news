import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    create(req: any, createAlertDto: {
        type: string;
        token: string;
        price: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        token: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }>;
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        token: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }[]>;
    remove(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
