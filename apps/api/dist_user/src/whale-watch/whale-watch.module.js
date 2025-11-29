"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhaleWatchModule = void 0;
const common_1 = require("@nestjs/common");
const whale_watch_controller_1 = require("./whale-watch.controller");
const whale_watch_service_1 = require("./whale-watch.service");
const whale_alert_controller_1 = require("./whale-alert.controller");
const whale_alert_service_1 = require("./whale-alert.service");
const prisma_module_1 = require("../prisma/prisma.module");
const blockchain_module_1 = require("../blockchain/blockchain.module");
const email_module_1 = require("../email/email.module");
let WhaleWatchModule = class WhaleWatchModule {
};
exports.WhaleWatchModule = WhaleWatchModule;
exports.WhaleWatchModule = WhaleWatchModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, blockchain_module_1.BlockchainModule, email_module_1.EmailModule],
        controllers: [whale_watch_controller_1.WhaleWatchController, whale_alert_controller_1.WhaleAlertController],
        providers: [whale_watch_service_1.WhaleWatchService, whale_alert_service_1.WhaleAlertService],
        exports: [whale_watch_service_1.WhaleWatchService, whale_alert_service_1.WhaleAlertService],
    })
], WhaleWatchModule);
//# sourceMappingURL=whale-watch.module.js.map