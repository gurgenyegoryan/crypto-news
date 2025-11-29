import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { EmailService } from '../email/email.service';
export declare class SubscriptionReminderService {
    private prisma;
    private telegramService;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, telegramService: TelegramService, emailService: EmailService);
    checkAndSendReminders(): Promise<void>;
    private sendReminders;
    private sendExpiryNotifications;
    private getReminderMessage;
}
