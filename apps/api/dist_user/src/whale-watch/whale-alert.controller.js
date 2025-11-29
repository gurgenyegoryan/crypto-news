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
exports.WhaleAlertController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const whale_alert_service_1 = require("./whale-alert.service");
let WhaleAlertController = class WhaleAlertController {
    whaleAlertService;
    constructor(whaleAlertService) {
        this.whaleAlertService = whaleAlertService;
    }
    async getUserAlerts(req) {
        return this.whaleAlertService.getUserAlerts(req.user.userId);
    }
    async createAlert(req, body) {
        return this.whaleAlertService.createAlert(req.user.userId, body);
    }
    async deleteAlert(req, id) {
        return this.whaleAlertService.deleteAlert(req.user.userId, id);
    }
};
exports.WhaleAlertController = WhaleAlertController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhaleAlertController.prototype, "getUserAlerts", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhaleAlertController.prototype, "createAlert", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WhaleAlertController.prototype, "deleteAlert", null);
exports.WhaleAlertController = WhaleAlertController = __decorate([
    (0, common_1.Controller)('whale-alerts'),
    __metadata("design:paramtypes", [whale_alert_service_1.WhaleAlertService])
], WhaleAlertController);
//# sourceMappingURL=whale-alert.controller.js.map