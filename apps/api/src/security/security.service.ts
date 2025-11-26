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

        // In production, you would:
        // 1. Fetch contract source code
        // 2. Check for common scam patterns
        // 3. Verify liquidity locks
        // 4. Check ownership status
        // 5. Use honeypot detection APIs (e.g., honeypot.is)

        // For now, we'll do basic checks using free APIs

        try {
            // Check Etherscan for contract verification
            const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
            const response = await axios.get(`https://api.etherscan.io/api`, {
                params: {
                    module: 'contract',
                    action: 'getsourcecode',
                    address,
                    apikey: apiKey,
                },
            });

            if (response.data.status === '1' && response.data.result[0]) {
                const contract = response.data.result[0];

                // Check if verified
                if (contract.SourceCode === '') {
                    warnings.push('Contract is not verified on Etherscan');
                    securityScore -= 30;
                }

                // Check proxy patterns
                if (contract.Proxy === '1') {
                    warnings.push('Contract is a proxy - ownership could change');
                    securityScore -= 10;
                }
            } else {
                warnings.push('Unable to fetch contract information');
                securityScore -= 20;
            }
        } catch (error) {
            console.error('[Security] Error fetching contract data:', error.message);
            warnings.push('Analysis incomplete - API error');
            securityScore -= 15;
        }

        // Simulated checks (in production, you'd use real data)
        const isHoneypot = securityScore < 40;
        const isRugPull = securityScore < 50;
        const ownershipRenounced = securityScore > 70;
        const liquidityLocked = securityScore > 60;

        if (isHoneypot) {
            warnings.push('⚠️ DANGER: Possible honeypot detected');
        }
        if (isRugPull) {
            warnings.push('⚠️ WARNING: High rug pull risk');
        }
        if (!ownershipRenounced) {
            warnings.push('⚠️ Ownership not renounced');
        }
        if (!liquidityLocked) {
            warnings.push('⚠️ Liquidity not locked');
        }

        return {
            securityScore: Math.max(0, securityScore),
            isHoneypot,
            isRugPull,
            ownershipRenounced,
            liquidityLocked,
            warnings,
        };
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
