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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentimentCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const sentiment_service_1 = require("./sentiment.service");
let SentimentCronService = class SentimentCronService {
    sentimentService;
    constructor(sentimentService) {
        this.sentimentService = sentimentService;
    }
    async analyzeSentiment() {
        console.log('[SentimentCron] Starting hourly sentiment analysis...');
        try {
            await this.sentimentService.analyzePopularTokens();
            console.log('[SentimentCron] Sentiment analysis completed');
        }
        catch (error) {
            console.error('[SentimentCron] Error during sentiment analysis:', error);
        }
    }
};
exports.SentimentCronService = SentimentCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SentimentCronService.prototype, "analyzeSentiment", null);
exports.SentimentCronService = SentimentCronService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sentiment_service_1.SentimentService])
], SentimentCronService);
//# sourceMappingURL=sentiment.cron.js.map