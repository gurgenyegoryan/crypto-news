"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let TelegramService = TelegramService_1 = class TelegramService {
    logger = new common_1.Logger(TelegramService_1.name);
    botToken;
    apiUrl;
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
        if (!this.botToken) {
            this.logger.warn('TELEGRAM_BOT_TOKEN not set. Telegram notifications will not work.');
        }
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }
    async sendMessage(chatId, message) {
        if (!this.botToken) {
            this.logger.warn('Cannot send Telegram message: bot token not configured');
            return false;
        }
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            });
            if (response.data.ok) {
                this.logger.log(`Message sent to Telegram chat ${chatId}`);
                return true;
            }
            else {
                this.logger.error(`Failed to send Telegram message: ${JSON.stringify(response.data)}`);
                return false;
            }
        }
        catch (error) {
            this.logger.error(`Error sending Telegram message: ${error.message}`);
            return false;
        }
    }
    async sendPriceAlert(chatId, token, currentPrice, targetPrice, type) {
        const emoji = type === 'above' ? '🚀' : '📉';
        const direction = type === 'above' ? 'above' : 'below';
        const message = `
${emoji} <b>Price Alert Triggered!</b>

<b>Token:</b> ${token.toUpperCase()}
<b>Current Price:</b> $${currentPrice.toFixed(2)}
<b>Target Price:</b> $${targetPrice.toFixed(2)}
<b>Movement:</b> ${direction.toUpperCase()} target

<a href="https://dexscreener.com/search?q=${token}">📊 View on DexScreener</a>
<a href="https://www.coingecko.com/en/search?q=${token}">🦎 View on CoinGecko</a>

<i>Time to act!</i> ⚡
        `.trim();
        return this.sendMessage(chatId, message);
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map