import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@Request() req: any) {
        const user = await this.usersService.findById(req.user.id);
        if (!user) {
            throw new Error('User not found');
        }
        const { password, verificationToken, verificationTokenExpiry, ...result } = user;
        return result;
    }

    @Patch('me')
    async updateProfile(
        @Request() req: any,
        @Body() body: { name?: string; email?: string; telegramId?: string | null; emailAlerts?: boolean }
    ) {
        const userId = req.user.id;

        // Prepare update data
        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        // Email updates might require verification logic, but for now we'll allow it or maybe skip it if it's complex. 
        // The plan said "Accept name, email, telegramId". Let's include email but be aware it might change login.
        // For safety in this task, I'll allow it as per plan.
        if (body.email !== undefined) updateData.email = body.email;
        if (body.telegramId !== undefined) updateData.telegramId = body.telegramId;
        if (body.emailAlerts !== undefined) updateData.emailAlerts = body.emailAlerts;

        const updatedUser = await this.usersService.update(userId, updateData);
        const { password, verificationToken, verificationTokenExpiry, ...result } = updatedUser;
        return result;
    }
}
