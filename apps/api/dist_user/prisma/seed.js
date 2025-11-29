"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
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
            premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
//# sourceMappingURL=seed.js.map