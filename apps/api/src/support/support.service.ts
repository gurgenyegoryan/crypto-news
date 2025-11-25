import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupportService {
    private readonly logger = new Logger(SupportService.name);
    private transporter: nodemailer.Transporter;

    constructor(private prisma: PrismaService, private config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.config.get<string>('SMTP_HOST'),
            port: this.config.get<number>('SMTP_PORT'),
            secure: this.config.get<boolean>('SMTP_SECURE'), // true for 465, false for other ports
            auth: {
                user: this.config.get<string>('SMTP_USER'),
                pass: this.config.get<string>('SMTP_PASS'),
            },
        });
    }

    async createTicket(data: {
        userId: string;
        name: string;
        surname: string;
        email: string;
        message: string;
    }) {
        const ticket = await this.prisma.supportTicket.create({
            data: {
                userId: data.userId,
                name: data.name,
                surname: data.surname,
                email: data.email,
                message: data.message,
            },
        });

        // Send email to support address
        const supportEmail = this.config.get<string>('SUPPORT_EMAIL');
        try {
            await this.transporter.sendMail({
                from: data.email,
                to: supportEmail,
                subject: `Support Ticket from ${data.name} ${data.surname}`,
                text: data.message,
            });
            this.logger.log(`Support email sent for ticket ${ticket.id}`);
        } catch (err) {
            this.logger.error('Failed to send support email', err);
        }

        return ticket;
    }

    async getUserTickets(userId: string) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async resolveTicket(ticketId: string) {
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: 'RESOLVED' },
        });
    }
}
