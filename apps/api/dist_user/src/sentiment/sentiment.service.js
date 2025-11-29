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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentimentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
let SentimentService = class SentimentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCurrentSentiment(token) {
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
    async getSentimentHistory(token, hours = 24) {
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
    async analyzeRedditSentiment(token) {
        try {
            const subreddits = ['cryptocurrency', 'bitcoin', 'ethereum', 'CryptoMarkets'];
            let totalScore = 0;
            let totalPosts = 0;
            for (const subreddit of subreddits) {
                try {
                    const response = await axios_1.default.get(`https://www.reddit.com/r/${subreddit}/search.json`, {
                        params: {
                            q: token,
                            restrict_sr: 'true',
                            sort: 'new',
                            limit: 25,
                        },
                        headers: {
                            'User-Agent': 'CryptoMonitor/1.0',
                        },
                        timeout: 5000
                    });
                    if (response.data && response.data.data && response.data.data.children) {
                        const posts = response.data.data.children;
                        for (const post of posts) {
                            const data = post.data;
                            totalPosts++;
                            const upvoteRatio = data.upvote_ratio || 0.5;
                            const sentimentScore = (upvoteRatio - 0.5) * 2;
                            totalScore += sentimentScore;
                        }
                    }
                }
                catch (err) {
                    console.warn(`[Sentiment] Warning fetching from r/${subreddit}: ${err.message}`);
                }
            }
            if (totalPosts > 0) {
                const avgScore = totalScore / totalPosts;
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
            }
            else {
                console.log(`[Sentiment] No posts found for ${token}, creating neutral entry`);
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
        }
        catch (error) {
            console.error(`[Sentiment] Error analyzing Reddit for ${token}:`, error.message);
            throw error;
        }
    }
    async analyzePopularTokens() {
        const tokens = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'DOT'];
        for (const token of tokens) {
            await this.analyzeRedditSentiment(token);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    async getUserAlerts(userId) {
        return this.prisma.sentimentAlert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createAlert(userId, data) {
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
    async deleteAlert(userId, alertId) {
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
};
exports.SentimentService = SentimentService;
exports.SentimentService = SentimentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SentimentService);
//# sourceMappingURL=sentiment.service.js.map