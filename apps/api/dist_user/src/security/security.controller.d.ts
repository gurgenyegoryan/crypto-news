import { SecurityService } from './security.service';
export declare class SecurityController {
    private securityService;
    constructor(securityService: SecurityService);
    analyzeContract(body: {
        address: string;
        chain?: string;
    }): Promise<import("./security.service").SecurityAnalysis>;
    getApprovals(req: any): Promise<{
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
}
