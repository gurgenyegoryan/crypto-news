import { Controller, Get, UseGuards } from '@nestjs/common';
import { WhaleWatchService } from './whale-watch.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('whale-watch')
export class WhaleWatchController {
    constructor(private readonly whaleWatchService: WhaleWatchService) { }

    @Get()
    getTransactions() {
        return this.whaleWatchService.getWhaleTransactions();
    }
}
