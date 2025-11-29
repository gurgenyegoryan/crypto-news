import { SupportService } from './support.service';
declare class CreateTicketDto {
    name: string;
    surname: string;
    email: string;
    message: string;
}
declare class ResolveTicketDto {
    status: string;
}
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    createTicket(req: any, dto: CreateTicketDto): Promise<{
        email: string;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        surname: string;
        message: string;
        updatedAt: Date;
    }>;
    getUserTickets(req: any): Promise<{
        email: string;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        surname: string;
        message: string;
        updatedAt: Date;
    }[]>;
    resolveTicket(req: any, id: string, dto: ResolveTicketDto): Promise<{
        email: string;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        surname: string;
        message: string;
        updatedAt: Date;
    } | {
        error: string;
    }>;
}
export {};
