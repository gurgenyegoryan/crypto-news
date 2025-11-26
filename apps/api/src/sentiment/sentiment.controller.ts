import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SentimentService } from './sentiment.service';

@Controller('sentiment')
export class SentimentController {
    constructor(private sentimentService: SentimentService) { }

    @Get(':token')
    async getCurrentSentiment(@Param('token') token: string) {
        return this.sentimentService.getCurrentSentiment(token);
    }

    @Get(':token/history')
    async getSentimentHistory(
        @Param('token') token: string,
        @Query('hours') hours?: string,
    ) {
        const hoursNum = hours ? parseInt(hours) : 24;
        return this.sentimentService.getSentimentHistory(token, hoursNum);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('alerts/my')
    async getUserAlerts(@Request() req: any) {
        return this.sentimentService.getUserAlerts(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('alerts')
    async createAlert(@Request() req: any, @Body() body: {
        token: string;
        condition: string;
        threshold: number;
    }) {
        return this.sentimentService.createAlert(req.user.userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('alerts/:id')
    async deleteAlert(@Request() req: any, @Param('id') id: string) {
        return this.sentimentService.deleteAlert(req.user.userId, id);
    }
}
