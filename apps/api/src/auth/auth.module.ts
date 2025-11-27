import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        UsersModule,
        EmailModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret',
            signOptions: {
                expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any
            },
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
