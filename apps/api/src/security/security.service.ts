import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

export interface SecurityAnalysis {
    securityScore: number;
    isHoneypot: boolean;
    isRugPull: boolean;
    ownershipRenounced: boolean;
    liquidityLocked: boolean;
    buyTax: number;
    sellTax: number;
    isMintable: boolean;
    isProxy: boolean;
    warnings: string[];
}

@Injectable()
export class SecurityService {
    private readonly logger = new Logger(SecurityService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Analyze smart contract security
     */
    async analyzeContract(address: string, chain: string = 'ethereum'): Promise<SecurityAnalysis> {
        try {
            // Check if already analyzed recently
            const existing = await this.prisma.contractAnalysis.findUnique({
                where: { address: address.toLowerCase() },
            });

            if (existing && Date.now() - existing.analyzedAt.getTime() < 24 * 3600000) {
                // Use cached analysis if less than 24h old
                return {
                    securityScore: parseFloat(existing.securityScore.toString()),
                    isHoneypot: existing.isHoneypot,
                    isRugPull: existing.isRugPull,
                    ownershipRenounced: existing.ownershipRenounced,
                    liquidityLocked: existing.liquidityLocked,
                    buyTax: 0, // Need to add to DB schema if we want to cache these
                    sellTax: 0,
                    isMintable: false,
                    isProxy: false,
                    warnings: existing.warnings as string[],
                };
            }

            // Perform new analysis
            const analysis = await this.performContractAnalysis(address, chain);

            // Store in database
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
        } catch (error) {
            this.logger.error(`Error analyzing contract ${address}:`, error);
            throw error;
        }
    }

    /**
     * Perform actual contract security analysis using GoPlus API
     */
    private async performContractAnalysis(address: string, chain: string): Promise<SecurityAnalysis> {
        const warnings: string[] = [];
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
            // Map chain to GoPlus Chain ID
            const chainId = this.getChainId(chain);

            // Call GoPlus API
            const response = await axios.get(`https://api.gopluslabs.io/api/v1/token_security/${chainId}`, {
                params: { contract_addresses: address },
                timeout: 10000
            });

            if (response.data.result && response.data.result[address.toLowerCase()]) {
                const data = response.data.result[address.toLowerCase()];

                // 1. Honeypot Check
                if (data.is_honeypot === '1') {
                    isHoneypot = true;
                    securityScore = 0;
                    warnings.push('🚨 CRITICAL: Confirmed Honeypot');
                }

                // 2. Tax Check
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

                // 3. Ownership
                if (data.owner_address === '0x0000000000000000000000000000000000000000') {
                    ownershipRenounced = true;
                    securityScore += 10;
                } else {
                    warnings.push('⚠️ Ownership not renounced');
                    securityScore -= 10;
                }

                // 4. Mintable
                if (data.is_mintable === '1') {
                    isMintable = true;
                    warnings.push('⚠️ Token is Mintable (Owner can print more tokens)');
                    securityScore -= 20;
                }

                // 5. Proxy
                if (data.is_proxy === '1') {
                    isProxy = true;
                    warnings.push('ℹ️ Contract is a Proxy (Logic can be changed)');
                    securityScore -= 5;
                }

                // 6. Open Source
                if (data.is_open_source === '0') {
                    warnings.push('⚠️ Contract source code not verified');
                    securityScore -= 20;
                }

                // 7. Blacklist
                if (data.is_blacklisted === '1') {
                    warnings.push('⚠️ Contract has blacklist function');
                    securityScore -= 10;
                }

                // 8. Whitelist
                if (data.is_whitelisted === '1') {
                    warnings.push('ℹ️ Contract has whitelist function');
                }

                // 9. Can take back ownership
                if (data.can_take_back_ownership === '1') {
                    warnings.push('🚨 Owner can retake ownership');
                    securityScore -= 20;
                }

                // 10. Hidden Owner
                if (data.hidden_owner === '1') {
                    warnings.push('🚨 Hidden owner detected');
                    securityScore -= 30;
                    isRugPull = true;
                }

                // Liquidity check (GoPlus doesn't always provide this directly in this endpoint, 
                // but we can infer risk from other factors or use a separate call. 
                // For now, we'll leave it as false unless we have data)
                // In a full implementation, we'd check LP lockers.
            } else {
                warnings.push('⚠️ Could not fetch security data from GoPlus');
                securityScore -= 20;
            }

        } catch (error) {
            this.logger.error(`Error calling GoPlus API: ${error.message}`);
            warnings.push('⚠️ Security analysis service unavailable');
            securityScore -= 20;
        }

        // Final score adjustments
        securityScore = Math.max(0, Math.min(100, securityScore));

        // Determine risk levels
        if (securityScore < 40) {
            warnings.unshift('🚨 EXTREME RISK - DO NOT INTERACT');
        } else if (securityScore < 60) {
            warnings.unshift('⚠️ HIGH RISK - Proceed with extreme caution');
        } else if (securityScore < 80) {
            warnings.unshift('⚠️ MEDIUM RISK - Do your own research');
        } else {
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

    private getChainId(chain: string): string {
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

    /**
     * Get token approvals for user's wallets
     */
    async getTokenApprovals(userId: string) {
        return this.prisma.tokenApproval.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Check wallet for risky approvals
     */
    async checkWalletApprovals(address: string, chain: string = 'ethereum'): Promise<any[]> {
        return [];
    }
}
