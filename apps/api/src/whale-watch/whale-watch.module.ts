import { Module } from '@nestjs/common';
import { WhaleWatchController } from './whale-watch.controller';
import { WhaleWatchService } from './whale-watch.service';
import { WhaleAlertController } from './whale-alert.controller';
import { WhaleAlertService } from './whale-alert.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
    imports: [PrismaModule, BlockchainModule],
    controllers: [WhaleWatchController, WhaleAlertController],
    providers: [WhaleWatchService, WhaleAlertService],
    exports: [WhaleWatchService, WhaleAlertService],
})
export class WhaleWatchModule { }
