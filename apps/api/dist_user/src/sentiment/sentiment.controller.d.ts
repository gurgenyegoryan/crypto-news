import { SentimentService } from './sentiment.service';
export declare class SentimentController {
    private sentimentService;
    constructor(sentimentService: SentimentService);
    getCurrentSentiment(token: string): Promise<import("./sentiment.service").SentimentScore>;
    getSentimentHistory(token: string, hours?: string): Promise<{
        id: string;
        createdAt: Date;
        token: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        source: string;
        timestamp: Date;
        score: import("@prisma/client/runtime/library").Decimal;
        volume: number;
    }[]>;
    getUserAlerts(req: any): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        userId: string;
        token: string;
        condition: string;
        threshold: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createAlert(req: any, body: {
        token: string;
        condition: string;
        threshold: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        userId: string;
        token: string;
        condition: string;
        threshold: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteAlert(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        userId: string;
        token: string;
        condition: string;
        threshold: import("@prisma/client/runtime/library").Decimal;
    }>;
    analyzeToken(body: {
        token: string;
    }): Promise<import("./sentiment.service").SentimentScore | null>;
}
