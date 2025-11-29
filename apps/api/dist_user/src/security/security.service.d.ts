import { PrismaService } from '../prisma/prisma.service';
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
export declare class SecurityService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    analyzeContract(address: string, chain?: string): Promise<SecurityAnalysis>;
    private performContractAnalysis;
    private getChainId;
    getTokenApprovals(userId: string): Promise<{
        id: string;
        createdAt: Date;
        chain: string;
        userId: string;
        amount: string;
        walletAddress: string;
        tokenAddress: string;
        spenderAddress: string;
        isRisky: boolean;
    }[]>;
    checkWalletApprovals(address: string, chain?: string): Promise<any[]>;
}
