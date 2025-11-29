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
exports.WhaleWatchController = void 0;
const common_1 = require("@nestjs/common");
const whale_watch_service_1 = require("./whale-watch.service");
let WhaleWatchController = class WhaleWatchController {
    whaleWatchService;
    constructor(whaleWatchService) {
        this.whaleWatchService = whaleWatchService;
    }
    getTransactions() {
        return this.whaleWatchService.getWhaleTransactions();
    }
};
exports.WhaleWatchController = WhaleWatchController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhaleWatchController.prototype, "getTransactions", null);
exports.WhaleWatchController = WhaleWatchController = __decorate([
    (0, common_1.Controller)('whale-watch'),
    __metadata("design:paramtypes", [whale_watch_service_1.WhaleWatchService])
], WhaleWatchController);
//# sourceMappingURL=whale-watch.controller.js.map