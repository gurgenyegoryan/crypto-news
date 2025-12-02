import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api:3000';

export const useRealtime = () => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');

        // Don't attempt to connect if there is no token
        if (!token) {
            return;
        }

        // Connect to the 'events' namespace
        socketRef.current = io(`${SOCKET_URL}/events`, {
            auth: {
                token: `Bearer ${token}`
            },
            query: {
                token: token
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
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
            // Suppress 403 errors to keep console clean, as they are expected when auth fails
            if (err.message.includes('403') || (err as any).data?.code === 403) {
                console.warn('WebSocket auth failed (403). This is expected if session expired.');
            } else {
                console.error('WebSocket connection error:', err.message);
            }
            setIsConnected(false);
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
