import { PrismaService } from '../prisma/prisma.service';
export declare class SupportService {
    private prisma;
    private readonly logger;
    private transporter;
    constructor(prisma: PrismaService);
    createTicket(data: {
        userId: string;
        name: string;
        surname: string;
        email: string;
        message: string;
    }): Promise<{
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
    getUserTickets(userId: string): Promise<{
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
    resolveTicket(userId: string, ticketId: string): Promise<{
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
}
