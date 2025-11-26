import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WhaleAlertService } from './whale-alert.service';

@Controller('whale-alerts')
export class WhaleAlertController {
    constructor(private whaleAlertService: WhaleAlertService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getUserAlerts(@Request() req: any) {
        return this.whaleAlertService.getUserAlerts(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async createAlert(@Request() req: any, @Body() body: {
        walletAddress: string;
        walletLabel?: string;
        chain: string;
        minAmount: number;
    }) {
        return this.whaleAlertService.createAlert(req.user.userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteAlert(@Request() req: any, @Param('id') id: string) {
        return this.whaleAlertService.deleteAlert(req.user.userId, id);
    }
}
