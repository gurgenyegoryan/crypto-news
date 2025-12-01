import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BlockchainService } from '../src/blockchain/blockchain.service';
import { SentimentService } from '../src/sentiment/sentiment.service';
import { SecurityService } from '../src/security/security.service';
import { CopyTradingService } from '../src/copy-trading/copy-trading.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Logger } from '@nestjs/common';

async function verifyAllFeatures() {
    const logger = new Logger('FeatureVerification');
    const app = await NestFactory.createApplicationContext(AppModule);

    const blockchainService = app.get(BlockchainService);
    const sentimentService = app.get(SentimentService);
    const securityService = app.get(SecurityService);
    const copyTradingService = app.get(CopyTradingService);
    const prismaService = app.get(PrismaService);

    console.log('\n==================================================');
    console.log('🚀 STARTING FEATURE VERIFICATION');
    console.log('==================================================\n');

    // 1. Verify Whale Watch
    console.log('🐳 Verifying Whale Watch...');
    try {
        const transactions = await blockchainService.getRecentLargeEthTransactions(1); // Low threshold for testing
        if (transactions.length > 0) {
            console.log(`   ✅ Successfully fetched ${transactions.length} whale transactions.`);
            console.log(`   Sample: ${transactions[0].hash.substring(0, 10)}... (${transactions[0].value} ETH)`);
        } else {
            console.log('   ⚠️ No whale transactions found (might be quiet or API issue).');
        }
    } catch (error) {
        console.error('   ❌ Whale Watch Verification Failed:', error.message);
    }

    // 2. Verify Sentiment Analysis
    console.log('\n🧠 Verifying Sentiment Analysis...');
    try {
        // Analyze BTC
        await sentimentService.analyzeRedditSentiment('BTC');
        const sentiment = await sentimentService.getCurrentSentiment('BTC');
        if (sentiment) {
            console.log(`   ✅ Successfully analyzed BTC sentiment.`);
            console.log(`   Score: ${sentiment.score.toFixed(2)} (Volume: ${sentiment.volume})`);
        } else {
            console.log('   ⚠️ Sentiment analysis ran but returned no data.');
        }
    } catch (error) {
        console.error('   ❌ Sentiment Verification Failed:', error.message);
    }

    // 3. Verify Security Scanner
    console.log('\n🛡️ Verifying Security Scanner...');
    try {
        // USDT Contract Address (Safe)
        const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
        const analysis = await securityService.analyzeContract(usdtAddress, 'ethereum');

        if (analysis) {
            console.log(`   ✅ Successfully analyzed USDT contract.`);
            console.log(`   Security Score: ${analysis.securityScore}/100`);
            console.log(`   Honeypot: ${analysis.isHoneypot}`);
            console.log(`   Warnings: ${JSON.stringify(analysis.warnings)}`);
            if (analysis.securityScore > 80) {
                console.log('   ✅ Score logic seems correct (USDT is generally safe).');
            } else {
                console.log('   ⚠️ Score seems low for USDT, check logic.');
            }
        } else {
            console.log('   ❌ No analysis returned.');
        }
    } catch (error) {
        console.error('   ❌ Security Scanner Verification Failed:', error.message);
    }

    // 4. Verify Copy Trading
    console.log('\n📋 Verifying Copy Trading...');
    try {
        // Create a temporary test user if needed, or find one
        let user = await prismaService.user.findFirst({ where: { email: 'test-verification@example.com' } });
        if (!user) {
            user = await prismaService.user.create({
                data: {
                    email: 'test-verification@example.com',
                    password: 'hashedpassword123', // Not logging in, so hash doesn't matter much here
                    name: 'Verification User',
                    tier: 'pro', // Needs to be pro for copy trading
                }
            });
            console.log('   Created test user for verification.');
        } else {
            // Ensure tier is pro
            if (user.tier !== 'pro') {
                await prismaService.user.update({ where: { id: user.id }, data: { tier: 'pro' } });
                console.log('   Upgraded test user to PRO.');
            }
        }

        // Create Config
        const config = await copyTradingService.createConfig(user.id, {
            followedWallet: '0x1234567890123456789012345678901234567890',
            chain: 'ethereum',
            maxAmountPerTrade: 0.1,
            stopLossPercent: 5,
            takeProfitPercent: 10
        });
        console.log(`   ✅ Created copy trading config: ${config.id}`);

        // Simulate Whale Transaction
        const mockWhaleTx = {
            hash: '0xmocktransactionhash' + Date.now(),
            from: '0x1234567890123456789012345678901234567890', // Matches config
            to: '0xuniswaprouter...',
            value: '10.0',
            token: 'ETH',
            timestamp: Date.now(),
            chain: 'Ethereum'
        };

        // Execute (Simulate) Trade
        await copyTradingService.executeCopyTrade(config.id, mockWhaleTx);

        // Verify Trade Record
        const trades = await copyTradingService.getTradeHistory(user.id, 1);
        if (trades.length > 0 && trades[0].whaleTxHash === mockWhaleTx.hash) {
            console.log('   ✅ Copy trade simulation successful. Trade record created.');
            console.log(`   Trade Status: ${trades[0].status}`);
        } else {
            console.log('   ❌ Copy trade record NOT found.');
        }

        // Cleanup
        await copyTradingService.deleteConfig(user.id, config.id);
        // await prismaService.user.delete({ where: { id: user.id } }); // Keep user for future runs or delete? Let's keep for now.
        console.log('   Cleaned up test config.');

    } catch (error) {
        console.error('   ❌ Copy Trading Verification Failed:', error.message);
    }

    console.log('\n==================================================');
    console.log('🏁 VERIFICATION COMPLETE');
    console.log('==================================================\n');

    await app.close();
}

verifyAllFeatures();
