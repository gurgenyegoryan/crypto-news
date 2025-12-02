"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
async function testRealtime() {
    console.log('Starting Real-Time Infrastructure Test...');
    const socket = (0, socket_io_client_1.io)('http://https://api.cryptomonitor.app/events', {
        transports: ['websocket'],
    });
    socket.on('connect', () => {
        console.log('✅ Connected to WebSocket Gateway');
        console.log('Testing subscription to tickers...');
        socket.emit('subscribeToTicker', ['BTC', 'ETH']);
    });
    socket.on('connect_error', (err) => {
        console.error('❌ Connection Error:', err.message);
        process.exit(1);
    });
    socket.on('tickerUpdate', (data) => {
        console.log(`✅ Received ticker update for ${data.token}: $${data.price}`);
        socket.disconnect();
        process.exit(0);
    });
    setTimeout(() => {
        console.error('❌ Timeout: No ticker updates received within 30 seconds');
        socket.disconnect();
        process.exit(1);
    }, 30000);
}
testRealtime();
//# sourceMappingURL=test-realtime.js.map