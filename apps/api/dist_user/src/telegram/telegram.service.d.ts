export declare class TelegramService {
    private readonly logger;
    private readonly botToken;
    private readonly apiUrl;
    constructor();
    sendMessage(chatId: string, message: string): Promise<boolean>;
    sendPriceAlert(chatId: string, token: string, currentPrice: number, targetPrice: number, type: string): Promise<boolean>;
}
