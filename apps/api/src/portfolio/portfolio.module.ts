import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceModule } from '../price/price.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
    imports: [PrismaModule, PriceModule, BlockchainModule],
    controllers: [PortfolioController],
    providers: [PortfolioService],
    exports: [PortfolioService],
})
export class PortfolioModule { }
