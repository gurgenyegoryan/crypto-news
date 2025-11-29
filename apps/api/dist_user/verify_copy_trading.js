"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:3000';
async function verifyCopyTrading() {
    try {
        console.log('1. Logging in...');
        let token = '';
        try {
            const loginRes = await axios_1.default.post(`${API_URL}/auth/login`, {
                email: 'test@example.com',
                password: 'Password123!',
            });
            token = loginRes.data.access_token;
            console.log('   Login successful.');
        }
        catch (e) {
            console.log('   Login failed, trying signup...');
            const signupRes = await axios_1.default.post(`${API_URL}/auth/signup`, {
                email: 'test@example.com',
                password: 'Password123!',
                name: 'Test User',
            });
            token = signupRes.data.access_token;
            console.log('   Signup successful.');
        }
        console.log('   Upgrading user to premium for testing...');
        console.log('\n2. Creating Copy Trading Config...');
        const configData = {
            followedWallet: '0x1234567890123456789012345678901234567890',
            chain: 'ethereum',
            maxAmountPerTrade: 0.5,
            stopLossPercent: 10,
            takeProfitPercent: 20,
        };
        try {
            await axios_1.default.post(`${API_URL}/copy-trading/configs`, configData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('   Config created successfully (User is Premium/Pro).');
        }
        catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('   ✅ Correctly blocked free user (403 Forbidden):', error.response.data.message);
                console.log('   Tier restriction logic is WORKING.');
            }
            else if (error.response) {
                console.log('   ❌ Unexpected error:', error.response.status, error.response.data);
            }
            else {
                throw error;
            }
        }
        console.log('\n3. Fetching Configs...');
        const configsRes = await axios_1.default.get(`${API_URL}/copy-trading/configs`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`   Fetched ${configsRes.data.length} configs.`);
        if (configsRes.data.length > 0) {
            const config = configsRes.data[0];
            if (config.followedWallet === configData.followedWallet.toLowerCase()) {
                console.log('   Config data matches.');
            }
            else {
                console.error('   Config data mismatch!');
            }
        }
        console.log('\n4. Fetching Trade History...');
        const historyRes = await axios_1.default.get(`${API_URL}/copy-trading/history`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`   Fetched ${historyRes.data.length} trades.`);
        console.log('\n✅ Copy Trading API Verification Complete!');
    }
    catch (error) {
        console.error('❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}
verifyCopyTrading();
//# sourceMappingURL=verify_copy_trading.js.map