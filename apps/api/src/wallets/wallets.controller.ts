import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) { }

    @Post()
    async create(@Request() req: any, @Body() createWalletDto: { address: string; chain: string; label?: string }) {
        try {
            return await this.walletsService.create(req.user.id, createWalletDto);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get()
    findAll(@Request() req: any) {
        return this.walletsService.findAll(req.user.id);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.walletsService.remove(id, req.user.id);
    }
}
