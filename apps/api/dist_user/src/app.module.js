"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const wallets_module_1 = require("./wallets/wallets.module");
const alerts_module_1 = require("./alerts/alerts.module");
const email_module_1 = require("./email/email.module");
const worker_module_1 = require("./worker/worker.module");
const price_module_1 = require("./price/price.module");
const telegram_module_1 = require("./telegram/telegram.module");
const whale_watch_module_1 = require("./whale-watch/whale-watch.module");
const payments_module_1 = require("./payments/payments.module");
const support_module_1 = require("./support/support.module");
const blockchain_module_1 = require("./blockchain/blockchain.module");
const sentiment_module_1 = require("./sentiment/sentiment.module");
const portfolio_module_1 = require("./portfolio/portfolio.module");
const security_module_1 = require("./security/security.module");
const copy_trading_module_1 = require("./copy-trading/copy-trading.module");
const realtime_module_1 = require("./realtime/realtime.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            wallets_module_1.WalletsModule,
            alerts_module_1.AlertsModule,
            email_module_1.EmailModule,
            worker_module_1.WorkerModule,
            price_module_1.PriceModule,
            telegram_module_1.TelegramModule,
            whale_watch_module_1.WhaleWatchModule,
            payments_module_1.PaymentsModule,
            support_module_1.SupportModule,
            blockchain_module_1.BlockchainModule,
            sentiment_module_1.SentimentModule,
            portfolio_module_1.PortfolioModule,
            security_module_1.SecurityModule,
            copy_trading_module_1.CopyTradingModule,
            realtime_module_1.RealtimeModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map