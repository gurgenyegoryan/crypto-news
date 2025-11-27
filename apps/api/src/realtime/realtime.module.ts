import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeGateway } from './realtime.gateway';

@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || '07140530688366544491071eba37720f', // Fallback for dev
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [RealtimeGateway],
    exports: [RealtimeGateway],
})
export class RealtimeModule { }
