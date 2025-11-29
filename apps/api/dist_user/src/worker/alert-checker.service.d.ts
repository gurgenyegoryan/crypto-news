import { PrismaService } from '../prisma/prisma.service';
import { PriceService } from '../price/price.service';
import { TelegramService } from '../telegram/telegram.service';
export declare class AlertCheckerService {
    private prisma;
    private priceService;
    private telegramService;
    private readonly logger;
    constructor(prisma: PrismaService, priceService: PriceService, telegramService: TelegramService);
    checkAlerts(): Promise<void>;
}
