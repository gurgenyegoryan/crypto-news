import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateTicketDto {
    name: string;
    surname: string;
    email: string;
    message: string;
}

class ResolveTicketDto {
    status: string; // expecting 'RESOLVED'
}

@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Post('tickets')
    async createTicket(@Request() req, @Body() dto: CreateTicketDto) {
        const userId = req.user.sub; // assuming JWT payload has sub
        return this.supportService.createTicket({
            userId,
            name: dto.name,
            surname: dto.surname,
            email: dto.email,
            message: dto.message,
        });
    }

    @Get('tickets')
    async getUserTickets(@Request() req) {
        const userId = req.user.sub;
        return this.supportService.getUserTickets(userId);
    }

    @Patch('tickets/:id')
    async resolveTicket(@Param('id') id: string, @Body() dto: ResolveTicketDto) {
        if (dto.status !== 'RESOLVED') {
            return { error: 'Invalid status' };
        }
        return this.supportService.resolveTicket(id);
    }
}
