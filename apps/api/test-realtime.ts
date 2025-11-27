import { io } from 'socket.io-client';

async function testRealtime() {
    console.log('Starting Real-Time Infrastructure Test...');

    const socket = io('http://localhost:3000/events', {
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log('✅ Connected to WebSocket Gateway');

        // Test subscription
        console.log('Testing subscription to tickers...');
        socket.emit('subscribeToTicker', ['BTC', 'ETH']);
    });

    socket.on('connect_error', (err: any) => {
        console.error('❌ Connection Error:', err.message);
        process.exit(1);
    });

    socket.on('tickerUpdate', (data: any) => {
        console.log(`✅ Received ticker update for ${data.token}: $${data.price}`);
        // We received data, test passed!
        socket.disconnect();
        process.exit(0);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
        console.error('❌ Timeout: No ticker updates received within 30 seconds');
        socket.disconnect();
        process.exit(1);
    }, 30000);
}

testRealtime();
