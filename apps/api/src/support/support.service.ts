import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SupportService {
    private readonly logger = new Logger(SupportService.name);
    private transporter: nodemailer.Transporter;

    constructor(private prisma: PrismaService) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false otherwise
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
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
        const supportEmail = 'support@cryptomonitor.app';
        try {
            await this.transporter.sendMail({
                from: `"CryptoMonitor Support" <${process.env.SMTP_USER}>`,
                to: supportEmail,
                replyTo: data.email, // This ensures replies go to the client
                subject: `New Support Ticket: ${data.name} ${data.surname}`,
                html: `
                    <h3>New Support Ticket</h3>
                    <p><strong>User:</strong> ${data.name} ${data.surname}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>User ID:</strong> ${data.userId}</p>
                    <hr />
                    <p><strong>Message:</strong></p>
                    <p>${data.message.replace(/\n/g, '<br>')}</p>
                `,
            });
            this.logger.log(`Support email sent for ticket ${ticket.id}`);
        } catch (err) {
            this.logger.error('Failed to send support email', err);
            // We don't throw here to avoid failing the ticket creation if email fails
        }

        return ticket;
    }

    async getUserTickets(userId: string) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async resolveTicket(userId: string, ticketId: string) {
        // Verify ownership
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id: ticketId },
        });

        if (!ticket || ticket.userId !== userId) {
            throw new Error('Ticket not found or access denied');
        }

        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: 'RESOLVED' },
        });
    }
}
