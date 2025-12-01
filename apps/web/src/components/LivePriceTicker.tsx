"use client";

import React, { useEffect, useState } from 'react';
import { useRealtime } from '../hooks/useRealtime';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerData {
    token: string;
    price: number;
    change24h: number;
    timestamp: number;
}

export default function LivePriceTicker() {
    const { socket, isConnected, subscribeToTicker } = useRealtime();
    const [prices, setPrices] = useState<Map<string, TickerData>>(new Map());

    // Initial tokens to track
    const tokens = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

    useEffect(() => {
        if (isConnected && socket) {
            // Subscribe to updates
            subscribeToTicker(tokens);

            // Listen for updates
            socket.on('tickerUpdate', (data: TickerData) => {
                setPrices(prev => {
                    const newMap = new Map(prev);
                    newMap.set(data.token, data);
                    return newMap;
                });
            });

            return () => {
                socket.off('tickerUpdate');
            };
        }
    }, [isConnected, socket]);

    return (
        <div className="w-full bg-black/80 border-b border-white/10 overflow-hidden py-2">
            <div className="flex items-center gap-8 animate-scroll whitespace-nowrap">
                {/* Duplicate list for seamless scrolling effect */}
                {[...tokens, ...tokens].map((token, i) => {
                    const data = prices.get(token);

                    if (!data) {
                        return (
                            <div key={`${token}-${i}`} className="flex items-center gap-2 text-sm">
                                <span className="font-bold text-gray-300">{token}</span>
                                <span className="text-gray-600 text-xs">Loading...</span>
                            </div>
                        );
                    }

                    const price = data.price;
                    const isPositive = (data.change24h || 0) >= 0;

                    return (
                        <div key={`${token}-${i}`} className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-gray-300">{token}</span>
                            <span className="text-white font-mono">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                            <span className={`flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {Math.abs(data.change24h).toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
            </div>
            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 30s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
