import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupportService } from './support.service';

class CreateTicketDto {
    name: string;
    surname: string;
    email: string;
    message: string;
}

class ResolveTicketDto {
    status: string; // expecting 'RESOLVED'
}

@UseGuards(AuthGuard('jwt'))
@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Post('tickets')
    async createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
        const userId = req.user.id; // JwtStrategy returns { id: payload.sub, ... }
        return this.supportService.createTicket({
            userId,
            name: dto.name,
            surname: dto.surname,
            email: dto.email,
            message: dto.message,
        });
    }

    @Get('tickets')
    async getUserTickets(@Request() req: any) {
        const userId = req.user.id; // JwtStrategy returns { id: payload.sub, ... }
        return this.supportService.getUserTickets(userId);
    }

    @Patch('tickets/:id')
    async resolveTicket(@Request() req: any, @Param('id') id: string, @Body() dto: ResolveTicketDto) {
        if (dto.status !== 'RESOLVED') {
            return { error: 'Invalid status' };
        }
        const userId = req.user.id;
        return this.supportService.resolveTicket(userId, id);
    }
}
