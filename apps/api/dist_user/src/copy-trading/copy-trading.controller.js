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
exports.CopyTradingController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const copy_trading_service_1 = require("./copy-trading.service");
let CopyTradingController = class CopyTradingController {
    copyTradingService;
    constructor(copyTradingService) {
        this.copyTradingService = copyTradingService;
    }
    async getConfigs(req) {
        return this.copyTradingService.getUserConfigs(req.user.id);
    }
    async createConfig(req, body) {
        return this.copyTradingService.createConfig(req.user.id, body);
    }
    async toggleConfig(req, id) {
        return this.copyTradingService.toggleConfig(req.user.id, id);
    }
    async deleteConfig(req, id) {
        return this.copyTradingService.deleteConfig(req.user.id, id);
    }
    async getHistory(req, limit) {
        const limitNum = limit ? parseInt(limit) : 50;
        return this.copyTradingService.getTradeHistory(req.user.id, limitNum);
    }
    async getPerformance(req, id) {
        return this.copyTradingService.getConfigPerformance(req.user.id, id);
    }
};
exports.CopyTradingController = CopyTradingController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('configs'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CopyTradingController.prototype, "getConfigs", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('configs'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CopyTradingController.prototype, "createConfig", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('configs/:id/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CopyTradingController.prototype, "toggleConfig", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)('configs/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CopyTradingController.prototype, "deleteConfig", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CopyTradingController.prototype, "getHistory", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('configs/:id/performance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CopyTradingController.prototype, "getPerformance", null);
exports.CopyTradingController = CopyTradingController = __decorate([
    (0, common_1.Controller)('copy-trading'),
    __metadata("design:paramtypes", [copy_trading_service_1.CopyTradingService])
], CopyTradingController);
//# sourceMappingURL=copy-trading.controller.js.map