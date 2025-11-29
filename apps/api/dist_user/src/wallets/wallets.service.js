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
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
let WalletsService = class WalletsService {
    prisma;
    blockchainService;
    constructor(prisma, blockchainService) {
        this.prisma = prisma;
        this.blockchainService = blockchainService;
    }
    async create(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.tier !== 'premium') {
            const existingCount = await this.prisma.wallet.count({ where: { userId } });
            if (existingCount >= 1) {
                throw new Error('Free tier limit reached. Please upgrade to Premium to add more wallets.');
            }
        }
        const balance = await this.blockchainService.getBalance(data.address, data.chain);
        return this.prisma.wallet.create({
            data: {
                ...data,
                userId,
            },
        });
    }
    async findAll(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId },
        });
        const walletsWithBalances = await Promise.all(wallets.map(async (wallet) => {
            const balance = await this.blockchainService.getBalance(wallet.address, wallet.chain);
            return { ...wallet, balance };
        }));
        return walletsWithBalances;
    }
    async remove(id, userId) {
        return this.prisma.wallet.deleteMany({
            where: { id, userId },
        });
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map