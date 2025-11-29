"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerModule = void 0;
const common_1 = require("@nestjs/common");
const alert_checker_service_1 = require("./alert-checker.service");
const prisma_module_1 = require("../prisma/prisma.module");
const price_module_1 = require("../price/price.module");
const telegram_module_1 = require("../telegram/telegram.module");
let WorkerModule = class WorkerModule {
};
exports.WorkerModule = WorkerModule;
exports.WorkerModule = WorkerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, price_module_1.PriceModule, telegram_module_1.TelegramModule],
        providers: [alert_checker_service_1.AlertCheckerService],
        exports: [alert_checker_service_1.AlertCheckerService],
    })
], WorkerModule);
//# sourceMappingURL=worker.module.js.map