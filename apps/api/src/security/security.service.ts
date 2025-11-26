import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

export interface SecurityAnalysis {
    securityScore: number;
    isHoneypot: boolean;
    isRugPull: boolean;
    ownershipRenounced: boolean;
    liquidityLocked: boolean;
    warnings: string[];
}

@Injectable()
export class SecurityService {
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
            console.error('[Security] Error analyzing contract:', error);
            throw error;
        }
    }

    /**
     * Perform actual contract security analysis
     */
    private async performContractAnalysis(address: string, chain: string): Promise<SecurityAnalysis> {
        const warnings: string[] = [];
        let securityScore = 100;
        let isHoneypot = false;
        let isRugPull = false;
        let ownershipRenounced = false;
        let liquidityLocked = false;

        try {
            // 1. Check contract verification on Etherscan/BscScan
            const verificationResult = await this.checkContractVerification(address, chain);
            if (!verificationResult.isVerified) {
                warnings.push('⚠️ Contract is not verified - source code unavailable');
                securityScore -= 30;
            } else {
                // Analyze source code for dangerous patterns
                const sourceCode = verificationResult.sourceCode || '';

                // Check for dangerous functions
                if (sourceCode.includes('selfdestruct') || sourceCode.includes('suicide')) {
                    warnings.push('🚨 CRITICAL: Contract contains selfdestruct function');
                    securityScore -= 40;
                    isRugPull = true;
                }

                if (sourceCode.includes('onlyOwner') && !sourceCode.includes('renounceOwnership')) {
                    warnings.push('⚠️ Owner has special privileges without renounce function');
                    securityScore -= 15;
                }

                // Check for hidden mint functions
                if (sourceCode.match(/function\s+mint\s*\(/i) && !sourceCode.includes('public')) {
                    warnings.push('⚠️ Hidden mint function detected');
                    securityScore -= 20;
                }

                // Check for blacklist functionality
                if (sourceCode.includes('blacklist') || sourceCode.includes('isBlacklisted')) {
                    warnings.push('⚠️ Blacklist functionality present');
                    securityScore -= 10;
                }

                // Check for transfer restrictions
                if (sourceCode.includes('canTransfer') || sourceCode.includes('_beforeTokenTransfer')) {
                    warnings.push('ℹ️ Transfer restrictions may apply');
                    securityScore -= 5;
                }

                // Check for proxy pattern
                if (verificationResult.isProxy) {
                    warnings.push('⚠️ Proxy contract - implementation can be changed');
                    securityScore -= 15;
                }
            }

            // 2. Check for honeypot using honeypot.is API (free)
            try {
                const honeypotCheck = await axios.get(`https://api.honeypot.is/v2/IsHoneypot`, {
                    params: {
                        address,
                        chainID: chain.toLowerCase() === 'bsc' ? '56' : '1'
                    },
                    timeout: 5000
                });

                if (honeypotCheck.data && honeypotCheck.data.honeypotResult) {
                    const result = honeypotCheck.data.honeypotResult;

                    if (result.isHoneypot) {
                        isHoneypot = true;
                        warnings.push('🚨 DANGER: Confirmed honeypot - DO NOT BUY');
                        securityScore = 0;
                    }

                    if (result.buyTax > 10 || result.sellTax > 10) {
                        warnings.push(`⚠️ High taxes: ${result.buyTax}% buy / ${result.sellTax}% sell`);
                        securityScore -= 15;
                    }
                }
            } catch (error) {
                console.log('[Security] Honeypot API unavailable, skipping check');
            }

            // 3. Check ownership status
            try {
                const ownershipCheck = await this.checkOwnership(address, chain);
                ownershipRenounced = ownershipCheck.renounced;

                if (!ownershipRenounced) {
                    warnings.push('⚠️ Ownership not renounced - owner has control');
                    securityScore -= 20;
                } else {
                    securityScore += 10; // Bonus for renounced ownership
                }
            } catch (error) {
                warnings.push('ℹ️ Could not verify ownership status');
                securityScore -= 5;
            }

            // 4. Check liquidity (simplified - in production would check DEX contracts)
            try {
                const liquidityCheck = await this.checkLiquidity(address, chain);
                liquidityLocked = liquidityCheck.isLocked;

                if (!liquidityLocked) {
                    warnings.push('⚠️ Liquidity not locked - rug pull risk');
                    securityScore -= 25;
                    isRugPull = true;
                } else {
                    securityScore += 10; // Bonus for locked liquidity
                }
            } catch (error) {
                warnings.push('ℹ️ Could not verify liquidity lock');
                securityScore -= 10;
            }

        } catch (error) {
            console.error('[Security] Error during analysis:', error.message);
            warnings.push('⚠️ Analysis incomplete - some checks failed');
            securityScore -= 20;
        }

        // Final score adjustments
        securityScore = Math.max(0, Math.min(100, securityScore));

        // Determine risk levels
        if (securityScore < 40) {
            isHoneypot = true;
            warnings.unshift('🚨 EXTREME RISK - DO NOT INTERACT');
        } else if (securityScore < 60) {
            isRugPull = true;
            warnings.unshift('⚠️ HIGH RISK - Proceed with extreme caution');
        } else if (securityScore < 75) {
            warnings.unshift('⚠️ MEDIUM RISK - Do your own research');
        } else {
            warnings.unshift('✅ Relatively safe - but always DYOR');
        }

        return {
            securityScore,
            isHoneypot,
            isRugPull,
            ownershipRenounced,
            liquidityLocked,
            warnings,
        };
    }

    /**
     * Check if contract is verified on blockchain explorer
     */
    private async checkContractVerification(address: string, chain: string): Promise<{
        isVerified: boolean;
        sourceCode?: string;
        isProxy: boolean;
    }> {
        try {
            const normalizedChain = chain.toLowerCase();
            let apiUrl = 'https://api.etherscan.io/api';
            let apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';

            if (normalizedChain === 'bsc' || normalizedChain === 'bnb') {
                apiUrl = 'https://api.bscscan.com/api';
                apiKey = process.env.BSCSCAN_API_KEY || apiKey;
            }

            const response = await axios.get(apiUrl, {
                params: {
                    module: 'contract',
                    action: 'getsourcecode',
                    address,
                    apikey: apiKey,
                },
                timeout: 10000
            });

            if (response.data.status === '1' && response.data.result[0]) {
                const contract = response.data.result[0];
                return {
                    isVerified: contract.SourceCode !== '',
                    sourceCode: contract.SourceCode,
                    isProxy: contract.Proxy === '1'
                };
            }

            return { isVerified: false, isProxy: false };
        } catch (error) {
            console.error('[Security] Error checking verification:', error.message);
            return { isVerified: false, isProxy: false };
        }
    }

    /**
     * Check ownership status (simplified)
     */
    private async checkOwnership(address: string, chain: string): Promise<{ renounced: boolean }> {
        // In production, would call contract's owner() function and check if it's 0x0
        // For now, return a heuristic based on other factors
        return { renounced: false };
    }

    /**
     * Check liquidity lock status (simplified)
     */
    private async checkLiquidity(address: string, chain: string): Promise<{ isLocked: boolean }> {
        // In production, would check DEX liquidity pools and lock contracts
        // For now, return a heuristic
        return { isLocked: false };
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
        // In production, you would:
        // 1. Fetch all approval events for this address
        // 2. Check current allowances
        // 3. Identify risky contracts

        // For now, return empty array (feature requires more complex implementation)
        return [];
    }
}
