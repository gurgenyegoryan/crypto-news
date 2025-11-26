import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
    constructor(private securityService: SecurityService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('analyze')
    async analyzeContract(@Body() body: {
        address: string;
        chain?: string;
    }) {
        return this.securityService.analyzeContract(body.address, body.chain || 'ethereum');
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('approvals')
    async getApprovals(@Request() req: any) {
        return this.securityService.getTokenApprovals(req.user.userId);
    }
}
