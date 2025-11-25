import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() req: any) {
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('signup')
    async signup(@Body() req: any) {
        return this.authService.signup(req.email, req.password, req.name);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getProfile(@Request() req: any) {
        // Fetch fresh user data from database to get latest isVerified status
        const user = await this.authService.getUserById(req.user.id);
        if (!user) {
            throw new Error('User not found');
        }
        const { password, verificationToken, verificationTokenExpiry, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }

    @Post('verify')
    async verify(@Body() body: { token: string }) {
        return this.authService.verifyEmail(body.token);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('resend-verification')
    async resendVerification(@Request() req: any) {
        return this.authService.resendVerification(req.user);
    }
}
