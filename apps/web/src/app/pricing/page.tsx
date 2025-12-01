import React from 'react';

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold text-center mb-12">CryptoMonitor Pricing</h1>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                {/* Free Tier */}
                <div className="p-8 rounded-2xl bg-gray-800 border border-gray-700 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Free</h2>
                        <span className="px-4 py-2 bg-gray-700 text-gray-300 font-bold rounded-full text-sm">$0 / month</span>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                        <li>✅ 1 Wallet</li>
                        <li>✅ 3 Alerts</li>
                        <li>✅ Daily Digest</li>
                    </ul>
                    <a
                        href="/signup"
                        className="block w-full text-center py-3 mt-6 bg-gray-700 hover:bg-gray-600 font-bold rounded-lg transition-all"
                    >
                        Get Started
                    </a>
                </div>
                {/* Premium Tier */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-purple-900/50 border-2 border-purple-500/30 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Premium</h2>
                        <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full text-sm shadow-lg">
                            $1 / month
                        </span>
                    </div>
                    <p className="text-gray-300 mb-4">
                        Pay with USDT (TRC20) – instant activation. Cancel anytime.
                    </p>
                    <ul className="space-y-2 text-gray-300">
                        <li>✅ Unlimited price alerts</li>
                        <li>✅ Unlimited wallet tracking</li>
                        <li>✅ Real‑time whale transaction alerts</li>
                        <li>✅ Multi‑chain support (ETH, BTC, SOL, BSC)</li>
                        <li>✅ Advanced portfolio analytics</li>
                        <li>✅ Priority Telegram notifications</li>
                        <li>✅ 24/7 priority support</li>
                    </ul>
                    <a
                        href="/dashboard"
                        className="block w-full text-center py-3 mt-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 font-bold rounded-lg transition-all"
                    >
                        Upgrade to Premium
                    </a>
                </div>
            </div>
        </main>
    );
}

