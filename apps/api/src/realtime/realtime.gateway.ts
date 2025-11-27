import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'events',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('RealtimeGateway');
    private userSockets = new Map<string, string[]>(); // userId -> socketIds

    constructor(private jwtService: JwtService) { }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                // Allow anonymous connections for public data (like tickers)
                this.logger.log(`Anonymous client connected: ${client.id}`);
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });

            const userId = payload.sub;
            client.data.userId = userId;

            // Track user sockets
            const sockets = this.userSockets.get(userId) || [];
            sockets.push(client.id);
            this.userSockets.set(userId, sockets);

            // Join user-specific room
            client.join(`user:${userId}`);

            this.logger.log(`User ${userId} connected: ${client.id}`);
        } catch (error) {
            // Don't log JWT errors for anonymous connections - they're expected
            if (error.message !== 'jwt malformed' && error.message !== 'jwt must be provided') {
                this.logger.error(`Connection error: ${error.message}`);
            }
            // Allow connection anyway for public data
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            const sockets = this.userSockets.get(userId) || [];
            const updatedSockets = sockets.filter(id => id !== client.id);

            if (updatedSockets.length === 0) {
                this.userSockets.delete(userId);
            } else {
                this.userSockets.set(userId, updatedSockets);
            }

            this.logger.log(`User ${userId} disconnected: ${client.id}`);
        } else {
            this.logger.log(`Client disconnected: ${client.id}`);
        }
    }

    private extractToken(client: Socket): string | undefined {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            return authHeader.split(' ')[1];
        }
        return client.handshake.query.token as string;
    }

    @SubscribeMessage('subscribeToTicker')
    handleSubscribeTicker(@ConnectedSocket() client: Socket, @MessageBody() tokens: string[]) {
        tokens.forEach(token => {
            client.join(`ticker:${token.toUpperCase()}`);
        });
        return { status: 'subscribed', tokens };
    }

    @SubscribeMessage('unsubscribeFromTicker')
    handleUnsubscribeTicker(@ConnectedSocket() client: Socket, @MessageBody() tokens: string[]) {
        tokens.forEach(token => {
            client.leave(`ticker:${token.toUpperCase()}`);
        });
        return { status: 'unsubscribed', tokens };
    }

    // Public method to broadcast events
    broadcastTickerUpdate(token: string, data: any) {
        if (!this.server) {
            this.logger.warn('WebSocket server not initialized yet');
            return;
        }
        // Broadcast to both room subscribers and all clients
        this.server.to(`ticker:${token.toUpperCase()}`).emit('tickerUpdate', data);
        this.server.emit('tickerUpdate', data); // Also broadcast globally
    }

    // Send private update to specific user
    sendUserUpdate(userId: string, event: string, data: any) {
        if (!this.server) {
            this.logger.warn('WebSocket server not initialized yet');
            return;
        }
        this.server.to(`user:${userId}`).emit(event, data);
    }

    // Broadcast to all connected clients
    broadcastGlobal(event: string, data: any) {
        if (!this.server) {
            this.logger.warn('WebSocket server not initialized yet');
            return;
        }
        this.server.emit(event, data);
    }
}
