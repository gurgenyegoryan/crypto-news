import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
    imports: [BlockchainModule],
    controllers: [WalletsController],
    providers: [WalletsService],
})
export class WalletsModule { }
