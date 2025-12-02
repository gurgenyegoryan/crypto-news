import React, { useEffect, useState } from 'react';
import { useRealtime } from '@/hooks/useRealtime';

interface WinEvent {
    user: string;
    action: string;
    amount: string;
    token: string;
    time: number; // Timestamp
}

export default function RecentWins() {
    const { socket } = useRealtime();
    const [wins, setWins] = useState<WinEvent[]>([]);
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Initial seed data (empty or loading state could be used, but let's start empty)
    // We can also fetch recent history from an API endpoint if needed, but for now we'll just listen for new events.

    useEffect(() => {
        // Fetch initial data
        const fetchInitialData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://api:3000'}/whale-watch`);
                if (res.ok) {
                    const data = await res.json();
                    const initialWins = data.map((tx: any) => ({
                        user: "Whale Alert",
                        action: tx.toLabel ? `moved to ${tx.toLabel}` : "moved funds",
                        amount: `${parseFloat(tx.value).toFixed(2)} ${tx.token}`,
                        token: tx.chain,
                        time: tx.timestamp
                    }));
                    setWins(initialWins);
                }
            } catch (e) {
                console.error("Failed to fetch initial whale data", e);
            }
        };

        fetchInitialData();

        // Update relative time every minute
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleWhaleMovement = (data: any) => {
            const newWin: WinEvent = {
                user: "Whale Alert",
                action: data.toLabel ? `moved to ${data.toLabel}` : "moved funds",
                amount: `${parseFloat(data.value).toFixed(2)} ${data.token}`,
                token: data.chain,
                time: data.timestamp || Date.now()
            };

            setWins(prev => [newWin, ...prev].slice(0, 20)); // Keep last 20
        };

        socket.on('whale-movement', handleWhaleMovement);

        return () => {
            socket.off('whale-movement', handleWhaleMovement);
        };
    }, [socket]);

    const formatTimeAgo = (timestamp: number) => {
        const diff = Math.floor((currentTime - timestamp) / 60000); // minutes
        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff}m ago`;
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `${hours}h ago`;
        return '1d+ ago';
    };

    if (wins.length === 0) {
        return (
            <div className="w-full bg-gradient-to-r from-purple-900/20 via-black to-purple-900/20 border-y border-white/10 py-2 mb-6 text-center text-xs text-gray-500">
                Waiting for live market activity...
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-r from-purple-900/20 via-black to-purple-900/20 border-y border-white/10 overflow-hidden py-2 mb-6 relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

            <div className="flex whitespace-nowrap animate-scroll-slow hover:pause">
                {/* Duplicate list for seamless scrolling if we have enough items */}
                {(wins.length > 5 ? [...wins, ...wins] : wins).map((win, i) => (
                    <div key={i} className="inline-flex items-center gap-2 mx-6 text-sm">
                        <span className="font-bold text-purple-400">{win.user}</span>
                        <span className="text-gray-400">{win.action}</span>
                        <span className="font-bold text-blue-400">
                            {win.amount}
                        </span>
                        <span className="text-gray-500 text-xs">on {win.token}</span>
                        <span className="text-gray-600 text-xs">({formatTimeAgo(win.time)})</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .animate-scroll-slow {
                    animation: scroll 40s linear infinite;
                }
                .hover\\:pause:hover {
                    animation-play-state: paused;
                }
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
