import { Module } from '@nestjs/common';
import { WhaleWatchController } from './whale-watch.controller';
import { WhaleWatchService } from './whale-watch.service';

@Module({
    controllers: [WhaleWatchController],
    providers: [WhaleWatchService],
})
export class WhaleWatchModule { }
