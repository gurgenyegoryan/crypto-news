import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useRealtime = () => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');

        // Connect to the 'events' namespace
        socketRef.current = io(`${SOCKET_URL}/events`, {
            auth: {
                token: token ? `Bearer ${token}` : undefined
            },
            query: {
                token: token || undefined
            },
            transports: ['websocket'],
            reconnection: true,
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const subscribeToTicker = (tokens: string[]) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('subscribeToTicker', tokens);
        }
    };

    const unsubscribeFromTicker = (tokens: string[]) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('unsubscribeFromTicker', tokens);
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        subscribeToTicker,
        unsubscribeFromTicker,
    };
};
