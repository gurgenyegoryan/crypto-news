import axios from 'axios';

const API_URL = 'http://api:3000';
let authToken = '';
let userId = '';

// Test credentials
const TEST_USER = {
    email: 'test@example.com',
    password: 'Password123!',
};

async function runAllTests() {
    console.log('\n🧪 ========================================');
    console.log('   COMPREHENSIVE FEATURE TESTING');
    console.log('========================================\n');

    try {
        // 1. Authentication
        await testAuthentication();

        // 2. Wallet Management
        await testWalletManagement();

        // 3. Security Scanner
        await testSecurityScanner();

        // 4. Copy Trading
        await testCopyTrading();

        // 5. Whale Watch Alerts
        await testWhaleAlerts();

        // 6. Sentiment Analysis
        await testSentimentAnalysis();

        // 7. Portfolio Tracking
        await testPortfolioTracking();

        // 8. Payment System
        await testPaymentSystem();

        console.log('\n✅ ========================================');
        console.log('   ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('========================================\n');

    } catch (error: any) {
        console.error('\n❌ TEST SUITE FAILED:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

async function testAuthentication() {
    console.log('🔐 Testing Authentication...');

    // Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    authToken = loginRes.data.access_token;
    console.log('   ✅ Login successful');

    // Get user profile
    const profileRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    userId = profileRes.data.id;
    console.log(`   ✅ Profile fetched: ${profileRes.data.email} (${profileRes.data.tier})`);
}

async function testWalletManagement() {
    console.log('\n💼 Testing Wallet Management...');

    // Get existing wallets
    const walletsRes = await axios.get(`${API_URL}/wallets`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Fetched ${walletsRes.data.length} existing wallets`);

    // Add new wallet
    const newWallet = {
        label: 'Test Wallet ' + Date.now(),
        address: '0x' + Math.random().toString(16).substring(2, 42).padEnd(40, '0'),
        chain: 'ethereum',
    };

    const createRes = await axios.post(`${API_URL}/wallets`, newWallet, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Created wallet: ${createRes.data.label}`);

    // Delete test wallet
    await axios.delete(`${API_URL}/wallets/${createRes.data.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('   ✅ Deleted test wallet');
}

async function testSecurityScanner() {
    console.log('\n🛡️ Testing Security Scanner...');

    // Scan USDT contract
    const scanRes = await axios.post(
        `${API_URL}/security/analyze`,
        {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            chain: 'ethereum',
        },
        {
            headers: { Authorization: `Bearer ${authToken}` },
        }
    );

    console.log(`   ✅ Scanned USDT contract`);
    console.log(`   Security Score: ${scanRes.data.securityScore}/100`);
    console.log(`   Honeypot: ${scanRes.data.isHoneypot}`);
    console.log(`   Warnings: ${scanRes.data.warnings.length}`);

    if (scanRes.data.securityScore < 0 || scanRes.data.securityScore > 100) {
        throw new Error('Invalid security score');
    }
}

async function testCopyTrading() {
    console.log('\n📋 Testing Copy Trading...');

    // Get existing configs
    const configsRes = await axios.get(`${API_URL}/copy-trading/configs`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Fetched ${configsRes.data.length} existing configs`);

    // Note: Creating config requires Premium/Pro tier
    // We'll test the endpoint but expect it might fail for free users
    try {
        const newConfig = {
            followedWallet: '0x' + Math.random().toString(16).substring(2, 42).padEnd(40, '0'),
            chain: 'ethereum',
            maxAmountPerTrade: 0.1,
            stopLossPercent: 5,
            takeProfitPercent: 10,
        };

        const createRes = await axios.post(`${API_URL}/copy-trading/configs`, newConfig, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   ✅ Created copy trading config');

        // Delete it
        await axios.delete(`${API_URL}/copy-trading/configs/${createRes.data.id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   ✅ Deleted test config');
    } catch (error: any) {
        if (error.response?.status === 403) {
            console.log('   ⚠️ Config creation blocked (requires Premium) - EXPECTED');
        } else {
            throw error;
        }
    }

    // Get trade history
    const historyRes = await axios.get(`${API_URL}/copy-trading/history`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Fetched ${historyRes.data.length} trade history records`);
}

async function testWhaleAlerts() {
    console.log('\n🐋 Testing Whale Watch Alerts...');

    // Get whale transactions
    const whaleRes = await axios.get(`${API_URL}/whale-watch?limit=10`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Fetched ${whaleRes.data.length} whale transactions`);

    // Get user's whale alerts
    const alertsRes = await axios.get(`${API_URL}/whale-alerts`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Fetched ${alertsRes.data.length} whale alerts`);
}

async function testSentimentAnalysis() {
    console.log('\n🧠 Testing Sentiment Analysis...');

    // Get BTC sentiment
    const sentimentRes = await axios.get(`${API_URL}/sentiment/BTC`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });

    if (sentimentRes.data) {
        console.log(`   ✅ Fetched BTC sentiment`);
        console.log(`   Score: ${sentimentRes.data.score.toFixed(2)}`);
        console.log(`   Volume: ${sentimentRes.data.volume}`);
    } else {
        console.log('   ⚠️ No sentiment data available (might need to run cron)');
    }

    // Get sentiment history
    const historyRes = await axios.get(`${API_URL}/sentiment/BTC/history?hours=24`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Fetched ${historyRes.data.length} sentiment history records`);
}

async function testPortfolioTracking() {
    console.log('\n📊 Testing Portfolio Tracking...');

    // Get portfolio
    const portfolioRes = await axios.get(`${API_URL}/portfolio`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Fetched portfolio data`);
    console.log(`   Total Value: $${portfolioRes.data.totalValue?.toFixed(2) || '0.00'}`);

    // Get performance
    const perfRes = await axios.get(`${API_URL}/portfolio/performance`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Fetched performance metrics`);
}

async function testPaymentSystem() {
    console.log('\n💳 Testing Payment System...');

    // Get subscription status
    const statusRes = await axios.get(`${API_URL}/payments/subscription-status`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Subscription status: ${statusRes.data.tier || 'free'}`);

    // Get payment history
    const historyRes = await axios.get(`${API_URL}/payments/history`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`   ✅ Fetched ${historyRes.data.length} payment records`);
}

// Run all tests
runAllTests();
