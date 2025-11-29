"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SupportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nodemailer = __importStar(require("nodemailer"));
let SupportService = SupportService_1 = class SupportService {
    prisma;
    logger = new common_1.Logger(SupportService_1.name);
    transporter;
    constructor(prisma) {
        this.prisma = prisma;
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async createTicket(data) {
        const ticket = await this.prisma.supportTicket.create({
            data: {
                userId: data.userId,
                name: data.name,
                surname: data.surname,
                email: data.email,
                message: data.message,
            },
        });
        const supportEmail = 'support@cryptomonitor.app';
        try {
            await this.transporter.sendMail({
                from: `"CryptoMonitor Support" <${process.env.SMTP_USER}>`,
                to: supportEmail,
                replyTo: data.email,
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
        }
        catch (err) {
            this.logger.error('Failed to send support email', err);
        }
        return ticket;
    }
    async getUserTickets(userId) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async resolveTicket(userId, ticketId) {
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
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = SupportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map