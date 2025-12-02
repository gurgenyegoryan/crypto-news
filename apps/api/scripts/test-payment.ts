import axios from 'axios';

const API_URL = 'http://api:3000';

// Test credentials - UPDATE THESE WITH YOUR ACTUAL CREDENTIALS
const TEST_USER = {
    email: 'test@example.com',
    password: 'Password123!',
};

// Your transaction hash
const TX_HASH = 'YOUR_TRANSACTION_HASH_HERE';
const NETWORK = 'POLYGON'; // 'TRC20' or 'POLYGON'

async function testPayment() {
    console.log('\n💳 ========================================');
    console.log('   PAYMENT SYSTEM TEST');
    console.log('========================================\n');

    try {
        // Step 1: Login
        console.log('🔐 Step 1: Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, TEST_USER);
        const authToken = loginRes.data.access_token;
        console.log('   ✅ Login successful\n');

        // Step 2: Check current subscription status
        console.log('📊 Step 2: Checking current subscription status...');
        const beforeStatus = await axios.get(`${API_URL}/payments/subscription-status`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   Current tier:', beforeStatus.data.tier);
        console.log('   Subscription status:', beforeStatus.data.subscriptionStatus);
        console.log('   Premium until:', beforeStatus.data.premiumUntil || 'N/A');
        console.log('   Days remaining:', beforeStatus.data.daysRemaining || 0);
        console.log('   Is active:', beforeStatus.data.isActive);
        console.log('');

        // Step 3: Verify payment
        console.log('💰 Step 3: Verifying payment...');
        console.log('   Transaction hash:', TX_HASH);
        console.log('   Network:', NETWORK);
        console.log('   Expected amount: 1 USDT');
        console.log('');

        const verifyRes = await axios.post(
            `${API_URL}/payments/verify`,
            { txHash: TX_HASH, network: NETWORK },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );

        if (verifyRes.data.success) {
            console.log('   ✅ Payment verified successfully!');
            console.log('   Message:', verifyRes.data.message);
            console.log('   New tier:', verifyRes.data.tier);
            console.log('   Premium until:', verifyRes.data.premiumUntil);
        } else {
            console.log('   ❌ Payment verification failed');
            console.log('   Message:', verifyRes.data.message);
        }
        console.log('');

        // Step 4: Check updated subscription status
        console.log('📊 Step 4: Checking updated subscription status...');
        const afterStatus = await axios.get(`${API_URL}/payments/subscription-status`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   New tier:', afterStatus.data.tier);
        console.log('   Subscription status:', afterStatus.data.subscriptionStatus);
        console.log('   Premium until:', afterStatus.data.premiumUntil || 'N/A');
        console.log('   Days remaining:', afterStatus.data.daysRemaining || 0);
        console.log('   Is active:', afterStatus.data.isActive);
        console.log('');

        // Step 5: Check payment history
        console.log('📜 Step 5: Checking payment history...');
        const historyRes = await axios.get(`${API_URL}/payments/history`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log(`   Total payments: ${historyRes.data.length}`);
        if (historyRes.data.length > 0) {
            console.log('\n   Recent payments:');
            historyRes.data.slice(0, 3).forEach((payment: any, index: number) => {
                console.log(`   ${index + 1}. ${payment.amount} ${payment.currency} - ${payment.status}`);
                console.log(`      TX: ${payment.txHash}`);
                console.log(`      Date: ${new Date(payment.createdAt).toLocaleString()}`);
            });
        }

        console.log('\n✅ ========================================');
        console.log('   PAYMENT TEST COMPLETED SUCCESSFULLY!');
        console.log('========================================\n');

    } catch (error: any) {
        console.error('\n❌ PAYMENT TEST FAILED:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

// Run the test
testPayment();
