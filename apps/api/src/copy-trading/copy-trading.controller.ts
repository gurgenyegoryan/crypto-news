import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CopyTradingService } from './copy-trading.service';

@Controller('copy-trading')
export class CopyTradingController {
    constructor(private copyTradingService: CopyTradingService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('configs')
    async getConfigs(@Request() req: any) {
        return this.copyTradingService.getUserConfigs(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('configs')
    async createConfig(@Request() req: any, @Body() body: {
        followedWallet: string;
        chain: string;
        maxAmountPerTrade: number;
        stopLossPercent?: number;
        takeProfitPercent?: number;
    }) {
        return this.copyTradingService.createConfig(req.user.userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('configs/:id/toggle')
    async toggleConfig(@Request() req: any, @Param('id') id: string) {
        return this.copyTradingService.toggleConfig(req.user.userId, id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('configs/:id')
    async deleteConfig(@Request() req: any, @Param('id') id: string) {
        return this.copyTradingService.deleteConfig(req.user.userId, id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    async getHistory(@Request() req: any, @Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit) : 50;
        return this.copyTradingService.getTradeHistory(req.user.userId, limitNum);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('configs/:id/performance')
    async getPerformance(@Request() req: any, @Param('id') id: string) {
        return this.copyTradingService.getConfigPerformance(req.user.userId, id);
    }
}
