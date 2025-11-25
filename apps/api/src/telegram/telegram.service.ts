import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private readonly botToken: string;
    private readonly apiUrl: string;

    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
        if (!this.botToken) {
            this.logger.warn('TELEGRAM_BOT_TOKEN not set. Telegram notifications will not work.');
        }
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    async sendMessage(chatId: string, message: string): Promise<boolean> {
        if (!this.botToken) {
            this.logger.warn('Cannot send Telegram message: bot token not configured');
            return false;
        }

        try {
            const response = await axios.post(`${this.apiUrl}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            });

            if (response.data.ok) {
                this.logger.log(`Message sent to Telegram chat ${chatId}`);
                return true;
            } else {
                this.logger.error(`Failed to send Telegram message: ${JSON.stringify(response.data)}`);
                return false;
            }
        } catch (error) {
            this.logger.error(`Error sending Telegram message: ${error.message}`);
            return false;
        }
    }

    async sendPriceAlert(chatId: string, token: string, currentPrice: number, targetPrice: number, type: string): Promise<boolean> {
        const emoji = type === 'above' ? '🚀' : '📉';
        const direction = type === 'above' ? 'above' : 'below';

        const message = `
${emoji} <b>Price Alert Triggered!</b>

<b>Token:</b> ${token.toUpperCase()}
<b>Current Price:</b> $${currentPrice.toFixed(2)}
<b>Target Price:</b> $${targetPrice.toFixed(2)}

Your ${token.toUpperCase()} price alert has been triggered! The price is now ${direction} your target.
        `.trim();

        return this.sendMessage(chatId, message);
    }
}
