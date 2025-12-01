import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

export interface SentimentScore {
    token: string;
    score: number; // -1 to 1
    volume: number;
    source: string;
    timestamp: Date;
}

@Injectable()
export class SentimentService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get current sentiment for a token
     */
    async getCurrentSentiment(token: string): Promise<SentimentScore | null> {
        const oneHourAgo = new Date(Date.now() - 3600000);

        const sentiments = await this.prisma.sentimentData.findMany({
            where: {
                token: token.toUpperCase(),
                timestamp: {
                    gte: oneHourAgo,
                },
            },
            orderBy: { timestamp: 'desc' },
        });

        if (sentiments.length === 0) {
            return null;
        }

        // Aggregate sentiment scores
        const avgScore = sentiments.reduce((sum, s) => sum + parseFloat(s.score.toString()), 0) / sentiments.length;
        const totalVolume = sentiments.reduce((sum, s) => sum + s.volume, 0);

        return {
            token,
            score: avgScore,
            volume: totalVolume,
            source: 'aggregated',
            timestamp: new Date(),
        };
    }

    /**
     * Get sentiment history for a token
     */
    async getSentimentHistory(token: string, hours: number = 24) {
        const since = new Date(Date.now() - hours * 3600000);

        return this.prisma.sentimentData.findMany({
            where: {
                token: token.toUpperCase(),
                timestamp: {
                    gte: since,
                },
            },
            orderBy: { timestamp: 'asc' },
        });
    }

    /**
     * Analyze Reddit sentiment for crypto (using free Reddit API)
     */
    async analyzeRedditSentiment(token: string): Promise<void> {
        try {
            const subreddits = ['cryptocurrency', 'bitcoin', 'ethereum', 'CryptoMarkets'];
            let totalScore = 0;
            let totalPosts = 0;

            for (const subreddit of subreddits) {
                try {
                    const response = await axios.get(`https://www.reddit.com/r/${subreddit}/search.json`, {
                        params: {
                            q: token,
                            restrict_sr: 'true',
                            sort: 'new',
                            limit: 25,
                        },
                        headers: {
                            'User-Agent': 'CryptoMonitor/1.0',
                        },
                        timeout: 3000 // 3s timeout
                    });

                    if (response.data && response.data.data && response.data.data.children) {
                        const posts = response.data.data.children;

                        for (const post of posts) {
                            const data = post.data;
                            totalPosts++;

                            // Simple sentiment analysis based on score/upvotes
                            const upvoteRatio = data.upvote_ratio || 0.5;
                            // Normalize to -1 to 1 range
                            const sentimentScore = (upvoteRatio - 0.5) * 2;
                            totalScore += sentimentScore;
                        }
                    }
                } catch (err) {
                    // Log but continue to next subreddit
                    // console.warn(`[Sentiment] Warning fetching from r/${subreddit}: ${err.message}`);
                }
            }

            if (totalPosts > 0) {
                const avgScore = totalScore / totalPosts;

                // Store in database
                await this.prisma.sentimentData.create({
                    data: {
                        token: token.toUpperCase(),
                        score: avgScore,
                        volume: totalPosts,
                        source: 'reddit',
                        timestamp: new Date(),
                        metadata: {
                            subreddits,
                            postsAnalyzed: totalPosts,
                        },
                    },
                });

                console.log(`[Sentiment] Analyzed ${totalPosts} Reddit posts for ${token}: ${avgScore.toFixed(2)}`);
            } else {
                console.log(`[Sentiment] No posts found for ${token}, creating neutral entry`);
                // Create a neutral entry so we have something to show
                await this.prisma.sentimentData.create({
                    data: {
                        token: token.toUpperCase(),
                        score: 0,
                        volume: 0,
                        source: 'reddit',
                        timestamp: new Date(),
                        metadata: { note: 'No data found, default neutral' },
                    },
                });
            }
        } catch (error) {
            console.error(`[Sentiment] Error analyzing Reddit for ${token}:`, error.message);
            throw error;
        }
    }

    /**
     * Analyze sentiment for popular tokens
     */
    async analyzePopularTokens(): Promise<void> {
        const tokens = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'DOT'];

        for (const token of tokens) {
            await this.analyzeRedditSentiment(token);

            // Rate limiting: wait 2 seconds between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    /**
     * Get user's sentiment alerts
     */
    async getUserAlerts(userId: string) {
        return this.prisma.sentimentAlert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Create sentiment alert
     */
    async createAlert(userId: string, data: {
        token: string;
        condition: string;
        threshold: number;
    }) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.tier === 'free') {
            throw new Error('Sentiment alerts are only available for Premium users');
        }

        return this.prisma.sentimentAlert.create({
            data: {
                userId,
                token: data.token.toUpperCase(),
                condition: data.condition,
                threshold: data.threshold,
                active: true,
            },
        });
    }

    /**
     * Delete sentiment alert
     */
    async deleteAlert(userId: string, alertId: string) {
        const alert = await this.prisma.sentimentAlert.findFirst({
            where: { id: alertId, userId },
        });

        if (!alert) {
            throw new Error('Alert not found');
        }

        return this.prisma.sentimentAlert.delete({
            where: { id: alertId },
        });
    }
}
