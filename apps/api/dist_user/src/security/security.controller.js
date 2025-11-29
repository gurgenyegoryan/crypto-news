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
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const security_service_1 = require("./security.service");
let SecurityController = class SecurityController {
    securityService;
    constructor(securityService) {
        this.securityService = securityService;
    }
    async analyzeContract(body) {
        return this.securityService.analyzeContract(body.address, body.chain || 'ethereum');
    }
    async getApprovals(req) {
        return this.securityService.getTokenApprovals(req.user.userId);
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "analyzeContract", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('approvals'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getApprovals", null);
exports.SecurityController = SecurityController = __decorate([
    (0, common_1.Controller)('security'),
    __metadata("design:paramtypes", [security_service_1.SecurityService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map