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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentimentController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const sentiment_service_1 = require("./sentiment.service");
let SentimentController = class SentimentController {
    sentimentService;
    constructor(sentimentService) {
        this.sentimentService = sentimentService;
    }
    async getCurrentSentiment(token) {
        const sentiment = await this.sentimentService.getCurrentSentiment(token);
        return sentiment || {
            token,
            score: 0,
            volume: 0,
            source: 'no_data',
            timestamp: new Date(),
        };
    }
    async getSentimentHistory(token, hours) {
        const hoursNum = hours ? parseInt(hours) : 24;
        const history = await this.sentimentService.getSentimentHistory(token, hoursNum);
        return history || [];
    }
    async getUserAlerts(req) {
        return this.sentimentService.getUserAlerts(req.user.id);
    }
    async createAlert(req, body) {
        return this.sentimentService.createAlert(req.user.id, body);
    }
    async deleteAlert(req, id) {
        return this.sentimentService.deleteAlert(req.user.id, id);
    }
    async analyzeToken(body) {
        await this.sentimentService.analyzeRedditSentiment(body.token);
        return this.sentimentService.getCurrentSentiment(body.token);
    }
};
exports.SentimentController = SentimentController;
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SentimentController.prototype, "getCurrentSentiment", null);
__decorate([
    (0, common_1.Get)(':token/history'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SentimentController.prototype, "getSentimentHistory", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('alerts/my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SentimentController.prototype, "getUserAlerts", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('alerts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SentimentController.prototype, "createAlert", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)('alerts/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SentimentController.prototype, "deleteAlert", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SentimentController.prototype, "analyzeToken", null);
exports.SentimentController = SentimentController = __decorate([
    (0, common_1.Controller)('sentiment'),
    __metadata("design:paramtypes", [sentiment_service_1.SentimentService])
], SentimentController);
//# sourceMappingURL=sentiment.controller.js.map