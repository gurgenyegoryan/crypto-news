import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Brain, Shield, Copy, Bell } from 'lucide-react';

interface SentimentData {
    token: string;
    score: number;
    volume: number;
    source: string;
    timestamp: Date;
}

export default function SentimentAnalysis() {
    const [selectedToken, setSelectedToken] = useState('BTC');
    const [sentiment, setSentiment] = useState<SentimentData | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const tokens = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'DOT'];

    useEffect(() => {
        fetchSentiment();
        fetchHistory();
    }, [selectedToken]);

    const fetchSentiment = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://api:3000/sentiment/${selectedToken}`);
            const data = await response.json();
            setSentiment(data);
        } catch (error) {
            console.error('Error fetching sentiment:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch(`http://api:3000/sentiment/${selectedToken}/history?hours=24`);
            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const getSentimentColor = (score: number) => {
        if (score > 0.3) return 'text-green-500';
        if (score < -0.3) return 'text-red-500';
        return 'text-yellow-500';
    };

    const getSentimentLabel = (score: number) => {
        if (score > 0.5) return 'Very Bullish';
        if (score > 0.2) return 'Bullish';
        if (score > -0.2) return 'Neutral';
        if (score > -0.5) return 'Bearish';
        return 'Very Bearish';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Brain className="w-7 h-7 text-purple-500" />
                        AI Sentiment Analysis
                    </h2>
                    <p className="text-gray-400 mt-1">Real-time crypto sentiment from Reddit & social media</p>
                </div>
            </div>

            {/* Token Selector */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <label className="text-sm text-gray-400 mb-3 block">Select Token</label>
                <div className="grid grid-cols-5 gap-3">
                    {tokens.map((token) => (
                        <button
                            key={token}
                            onClick={() => setSelectedToken(token)}
                            className={`px-4 py-3 rounded-lg font-semibold transition-all ${selectedToken === token
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {token}
                        </button>
                    ))}
                </div>
            </div>

            {/* Current Sentiment */}
            {loading ? (
                <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading sentiment data...</p>
                </div>
            ) : sentiment ? (
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 border border-gray-700">
                    <div className="grid grid-cols-3 gap-8">
                        {/* Sentiment Score */}
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-2">Sentiment Score</p>
                            <div className={`text-5xl font-bold ${getSentimentColor(sentiment.score)}`}>
                                {sentiment.score > 0 ? '+' : ''}{(sentiment.score * 100).toFixed(1)}%
                            </div>
                            <p className={`text-lg font-semibold mt-2 ${getSentimentColor(sentiment.score)}`}>
                                {getSentimentLabel(sentiment.score)}
                            </p>
                        </div>

                        {/* Volume */}
                        <div className="text-center border-l border-r border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">Mentions (24h)</p>
                            <div className="text-5xl font-bold text-blue-500">
                                {sentiment.volume}
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Reddit posts analyzed</p>
                        </div>

                        {/* Trend */}
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-2">Trend</p>
                            <div className="flex items-center justify-center gap-2">
                                {sentiment.score > 0 ? (
                                    <TrendingUp className="w-12 h-12 text-green-500" />
                                ) : (
                                    <TrendingDown className="w-12 h-12 text-red-500" />
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                Last updated: {new Date(sentiment.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center">
                    <p className="text-gray-400">No sentiment data available yet</p>
                    <p className="text-sm text-gray-500 mt-2">Data is collected hourly</p>
                </div>
            )}

            {/* Sentiment History Chart */}
            {history.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">24-Hour Sentiment Trend</h3>
                    <div className="space-y-2">
                        {history.slice(0, 10).map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="text-sm text-gray-400 w-20">
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                                    <div
                                        className={`h-full ${parseFloat(item.score) > 0 ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${Math.abs(parseFloat(item.score)) * 100}%` }}
                                    ></div>
                                </div>
                                <span className={`text-sm font-semibold w-16 text-right ${getSentimentColor(parseFloat(item.score))}`}>
                                    {(parseFloat(item.score) * 100).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Premium Feature Notice */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                        <p className="text-purple-300 font-semibold">Premium Feature</p>
                        <p className="text-purple-200/70 text-sm mt-1">
                            Upgrade to Premium to set custom sentiment alerts and get notified when sentiment shifts dramatically
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
