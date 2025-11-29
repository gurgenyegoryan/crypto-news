import { PrismaService } from '../prisma/prisma.service';
export interface SentimentScore {
    token: string;
    score: number;
    volume: number;
    source: string;
    timestamp: Date;
}
export declare class SentimentService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentSentiment(token: string): Promise<SentimentScore | null>;
    getSentimentHistory(token: string, hours?: number): Promise<{
        id: string;
        createdAt: Date;
        token: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        source: string;
        timestamp: Date;
        score: import("@prisma/client/runtime/library").Decimal;
        volume: number;
    }[]>;
    analyzeRedditSentiment(token: string): Promise<void>;
    analyzePopularTokens(): Promise<void>;
    getUserAlerts(userId: string): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        userId: string;
        token: string;
        condition: string;
        threshold: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createAlert(userId: string, data: {
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
    deleteAlert(userId: string, alertId: string): Promise<{
        id: string;
        createdAt: Date;
        active: boolean;
        userId: string;
        token: string;
        condition: string;
        threshold: import("@prisma/client/runtime/library").Decimal;
    }>;
}
