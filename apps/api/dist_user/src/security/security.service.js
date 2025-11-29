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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
let SecurityService = SecurityService_1 = class SecurityService {
    prisma;
    logger = new common_1.Logger(SecurityService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async analyzeContract(address, chain = 'ethereum') {
        try {
            const existing = await this.prisma.contractAnalysis.findUnique({
                where: { address: address.toLowerCase() },
            });
            if (existing && Date.now() - existing.analyzedAt.getTime() < 24 * 3600000) {
                return {
                    securityScore: parseFloat(existing.securityScore.toString()),
                    isHoneypot: existing.isHoneypot,
                    isRugPull: existing.isRugPull,
                    ownershipRenounced: existing.ownershipRenounced,
                    liquidityLocked: existing.liquidityLocked,
                    buyTax: 0,
                    sellTax: 0,
                    isMintable: false,
                    isProxy: false,
                    warnings: existing.warnings,
                };
            }
            const analysis = await this.performContractAnalysis(address, chain);
            await this.prisma.contractAnalysis.upsert({
                where: { address: address.toLowerCase() },
                create: {
                    address: address.toLowerCase(),
                    chain,
                    securityScore: analysis.securityScore,
                    isHoneypot: analysis.isHoneypot,
                    isRugPull: analysis.isRugPull,
                    ownershipRenounced: analysis.ownershipRenounced,
                    liquidityLocked: analysis.liquidityLocked,
                    warnings: analysis.warnings,
                    analyzedAt: new Date(),
                },
                update: {
                    securityScore: analysis.securityScore,
                    isHoneypot: analysis.isHoneypot,
                    isRugPull: analysis.isRugPull,
                    ownershipRenounced: analysis.ownershipRenounced,
                    liquidityLocked: analysis.liquidityLocked,
                    warnings: analysis.warnings,
                    analyzedAt: new Date(),
                },
            });
            return analysis;
        }
        catch (error) {
            this.logger.error(`Error analyzing contract ${address}:`, error);
            throw error;
        }
    }
    async performContractAnalysis(address, chain) {
        const warnings = [];
        let securityScore = 100;
        let isHoneypot = false;
        let isRugPull = false;
        let ownershipRenounced = false;
        let liquidityLocked = false;
        let buyTax = 0;
        let sellTax = 0;
        let isMintable = false;
        let isProxy = false;
        try {
            const chainId = this.getChainId(chain);
            const response = await axios_1.default.get(`https://api.gopluslabs.io/api/v1/token_security/${chainId}`, {
                params: { contract_addresses: address },
                timeout: 10000
            });
            if (response.data.result && response.data.result[address.toLowerCase()]) {
                const data = response.data.result[address.toLowerCase()];
                if (data.is_honeypot === '1') {
                    isHoneypot = true;
                    securityScore = 0;
                    warnings.push('🚨 CRITICAL: Confirmed Honeypot');
                }
                buyTax = parseFloat(data.buy_tax || '0') * 100;
                sellTax = parseFloat(data.sell_tax || '0') * 100;
                if (buyTax > 10) {
                    warnings.push(`⚠️ High Buy Tax: ${buyTax.toFixed(2)}%`);
                    securityScore -= 10;
                }
                if (sellTax > 10) {
                    warnings.push(`⚠️ High Sell Tax: ${sellTax.toFixed(2)}%`);
                    securityScore -= 10;
                }
                if (buyTax > 50 || sellTax > 50) {
                    warnings.push('🚨 CRITICAL: Unreasonable Tax Rates');
                    securityScore -= 30;
                    isRugPull = true;
                }
                if (data.owner_address === '0x0000000000000000000000000000000000000000') {
                    ownershipRenounced = true;
                    securityScore += 10;
                }
                else {
                    warnings.push('⚠️ Ownership not renounced');
                    securityScore -= 10;
                }
                if (data.is_mintable === '1') {
                    isMintable = true;
                    warnings.push('⚠️ Token is Mintable (Owner can print more tokens)');
                    securityScore -= 20;
                }
                if (data.is_proxy === '1') {
                    isProxy = true;
                    warnings.push('ℹ️ Contract is a Proxy (Logic can be changed)');
                    securityScore -= 5;
                }
                if (data.is_open_source === '0') {
                    warnings.push('⚠️ Contract source code not verified');
                    securityScore -= 20;
                }
                if (data.is_blacklisted === '1') {
                    warnings.push('⚠️ Contract has blacklist function');
                    securityScore -= 10;
                }
                if (data.is_whitelisted === '1') {
                    warnings.push('ℹ️ Contract has whitelist function');
                }
                if (data.can_take_back_ownership === '1') {
                    warnings.push('🚨 Owner can retake ownership');
                    securityScore -= 20;
                }
                if (data.hidden_owner === '1') {
                    warnings.push('🚨 Hidden owner detected');
                    securityScore -= 30;
                    isRugPull = true;
                }
            }
            else {
                warnings.push('⚠️ Could not fetch security data from GoPlus');
                securityScore -= 20;
            }
        }
        catch (error) {
            this.logger.error(`Error calling GoPlus API: ${error.message}`);
            warnings.push('⚠️ Security analysis service unavailable');
            securityScore -= 20;
        }
        securityScore = Math.max(0, Math.min(100, securityScore));
        if (securityScore < 40) {
            warnings.unshift('🚨 EXTREME RISK - DO NOT INTERACT');
        }
        else if (securityScore < 60) {
            warnings.unshift('⚠️ HIGH RISK - Proceed with extreme caution');
        }
        else if (securityScore < 80) {
            warnings.unshift('⚠️ MEDIUM RISK - Do your own research');
        }
        else {
            warnings.unshift('✅ Low Risk - Contract looks healthy');
        }
        return {
            securityScore,
            isHoneypot,
            isRugPull,
            ownershipRenounced,
            liquidityLocked,
            buyTax,
            sellTax,
            isMintable,
            isProxy,
            warnings,
        };
    }
    getChainId(chain) {
        const normalized = chain.toLowerCase();
        switch (normalized) {
            case 'ethereum': return '1';
            case 'bsc': return '56';
            case 'polygon': return '137';
            case 'arbitrum': return '42161';
            case 'avalanche': return '43114';
            default: return '1';
        }
    }
    async getTokenApprovals(userId) {
        return this.prisma.tokenApproval.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async checkWalletApprovals(address, chain = 'ethereum') {
        return [];
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = SecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityService);
//# sourceMappingURL=security.service.js.map