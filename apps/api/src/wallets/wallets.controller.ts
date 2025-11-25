import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) { }

    @Post()
    create(@Request() req: any, @Body() createWalletDto: { address: string; chain: string; label?: string }) {
        return this.walletsService.create(req.user.userId, createWalletDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.walletsService.findAll(req.user.userId);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.walletsService.remove(id, req.user.userId);
    }
}
