import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private logger;
    private userSockets;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    private extractToken;
    handleSubscribeTicker(client: Socket, tokens: string[]): {
        status: string;
        tokens: string[];
    };
    handleUnsubscribeTicker(client: Socket, tokens: string[]): {
        status: string;
        tokens: string[];
    };
    broadcastTickerUpdate(token: string, data: any): void;
    sendUserUpdate(userId: string, event: string, data: any): void;
    broadcastGlobal(event: string, data: any): void;
}
