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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
let RealtimeGateway = class RealtimeGateway {
    jwtService;
    server;
    logger = new common_1.Logger('RealtimeGateway');
    userSockets = new Map();
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                this.logger.log(`Anonymous client connected: ${client.id}`);
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            const userId = payload.sub;
            client.data.userId = userId;
            const sockets = this.userSockets.get(userId) || [];
            sockets.push(client.id);
            this.userSockets.set(userId, sockets);
            client.join(`user:${userId}`);
            this.logger.log(`User ${userId} connected: ${client.id}`);
        }
        catch (error) {
            if (error.message !== 'jwt malformed' && error.message !== 'jwt must be provided') {
                this.logger.error(`Connection error: ${error.message}`);
            }
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            const sockets = this.userSockets.get(userId) || [];
            const updatedSockets = sockets.filter(id => id !== client.id);
            if (updatedSockets.length === 0) {
                this.userSockets.delete(userId);
            }
            else {
                this.userSockets.set(userId, updatedSockets);
            }
            this.logger.log(`User ${userId} disconnected: ${client.id}`);
        }
        else {
            this.logger.log(`Client disconnected: ${client.id}`);
        }
    }
    extractToken(client) {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            return authHeader.split(' ')[1];
        }
        return client.handshake.query.token;
    }
    handleSubscribeTicker(client, tokens) {
        tokens.forEach(token => {
            client.join(`ticker:${token.toUpperCase()}`);
        });
        return { status: 'subscribed', tokens };
    }
    handleUnsubscribeTicker(client, tokens) {
        tokens.forEach(token => {
            client.leave(`ticker:${token.toUpperCase()}`);
        });
        return { status: 'unsubscribed', tokens };
    }
    broadcastTickerUpdate(token, data) {
        if (!this.server) {
            this.logger.warn('WebSocket server not initialized yet');
            return;
        }
        this.server.to(`ticker:${token.toUpperCase()}`).emit('tickerUpdate', data);
        this.server.emit('tickerUpdate', data);
    }
    sendUserUpdate(userId, event, data) {
        if (!this.server) {
            this.logger.warn('WebSocket server not initialized yet');
            return;
        }
        this.server.to(`user:${userId}`).emit(event, data);
    }
    broadcastGlobal(event, data) {
        if (!this.server) {
            this.logger.warn('WebSocket server not initialized yet');
            return;
        }
        this.server.emit(event, data);
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribeToTicker'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleSubscribeTicker", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribeFromTicker'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleUnsubscribeTicker", null);
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: 'events',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map