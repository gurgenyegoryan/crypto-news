import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'demo@cryptomonitor.app' },
        update: {},
        create: {
            email: 'demo@cryptomonitor.app',
            password: hashedPassword,
            name: 'Demo User',
            tier: 'premium',
            isVerified: true,
            subscriptionStatus: 'active',
            premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            password: hashedPassword,
            name: 'Test User',
            tier: 'free',
            isVerified: true,
            subscriptionStatus: 'inactive',
        },
    });

    console.log('✅ Created users:', { user1: user1.email, user2: user2.email });

    // Create wallets for demo user
    const wallet1 = await prisma.wallet.create({
        data: {
            userId: user1.id,
            address: 'TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29',
            chain: 'eth',
            label: 'Main Ethereum Wallet',
        },
    });

    const wallet2 = await prisma.wallet.create({
        data: {
            userId: user1.id,
            address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
            chain: 'sol',
            label: 'Solana Wallet',
        },
    });

    console.log('✅ Created wallets:', { wallet1: wallet1.label, wallet2: wallet2.label });

    // Create alerts for demo user
    const alert1 = await prisma.alert.create({
        data: {
            userId: user1.id,
            type: 'price_above',
            token: 'ETH',
            price: 3000,
            isActive: true,
        },
    });

    const alert2 = await prisma.alert.create({
        data: {
            userId: user1.id,
            type: 'price_below',
            token: 'BTC',
            price: 40000,
            isActive: true,
        },
    });

    console.log('✅ Created alerts:', { alert1: alert1.token, alert2: alert2.token });

    // Create portfolio snapshots
    const snapshot = await prisma.portfolioSnapshot.create({
        data: {
            userId: user1.id,
            totalValueUsd: 12450.32,
            snapshotAt: new Date(),
        },
    });

    console.log('✅ Created portfolio snapshot:', snapshot.totalValueUsd);

    console.log('🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
