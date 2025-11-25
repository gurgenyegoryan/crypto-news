import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('alerts')
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Post()
    create(@Request() req: any, @Body() createAlertDto: { type: string; token: string; price: number }) {
        return this.alertsService.create(req.user.id, createAlertDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.alertsService.findAll(req.user.id);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.alertsService.remove(id, req.user.id);
    }
}
