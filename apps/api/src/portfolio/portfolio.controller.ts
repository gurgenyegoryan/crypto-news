import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
    constructor(private portfolioService: PortfolioService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getPortfolio(@Request() req: any) {
        return this.portfolioService.getUserPortfolio(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    async getHistory(@Request() req: any, @Query('days') days?: string) {
        const daysNum = days ? parseInt(days) : 30;
        return this.portfolioService.getPortfolioHistory(req.user.userId, daysNum);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('performance')
    async getPerformance(@Request() req: any) {
        return this.portfolioService.getPerformance(req.user.userId);
    }
}
