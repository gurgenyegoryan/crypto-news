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
        return this.authService.login(user, req.twoFactorCode);
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
        const { password, verificationToken, verificationTokenExpiry, twoFactorSecret, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('profile')
    async updateProfile(@Request() req: any, @Body() body: { name: string; email: string }) {
        return this.authService.updateProfile(req.user.id, body.name, body.email);
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

    @UseGuards(AuthGuard('jwt'))
    @Post('change-password')
    async changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
        return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
    }

    // === 2FA Endpoints ===

    @UseGuards(AuthGuard('jwt'))
    @Post('2fa/generate')
    async generate2FA(@Request() req: any) {
        return this.authService.generate2FASecret(req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('2fa/enable')
    async enable2FA(@Request() req: any, @Body() body: { code: string }) {
        return this.authService.enable2FA(req.user.id, body.code);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('2fa/disable')
    async disable2FA(@Request() req: any, @Body() body: { code: string }) {
        return this.authService.disable2FA(req.user.id, body.code);
    }
}
