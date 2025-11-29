"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyTradingModule = void 0;
const common_1 = require("@nestjs/common");
const copy_trading_controller_1 = require("./copy-trading.controller");
const copy_trading_service_1 = require("./copy-trading.service");
const prisma_module_1 = require("../prisma/prisma.module");
let CopyTradingModule = class CopyTradingModule {
};
exports.CopyTradingModule = CopyTradingModule;
exports.CopyTradingModule = CopyTradingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [copy_trading_controller_1.CopyTradingController],
        providers: [copy_trading_service_1.CopyTradingService],
        exports: [copy_trading_service_1.CopyTradingService],
    })
], CopyTradingModule);
//# sourceMappingURL=copy-trading.module.js.map