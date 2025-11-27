import Link from "next/link";
import LivePriceTicker from "@/components/LivePriceTicker";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            CryptoMonitor.app
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Live Ticker */}
      <div className="pt-16">
        <LivePriceTicker />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Live Telegram Alerts
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
              Track your crypto portfolio <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                directly on Telegram
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Real-time alerts for price moves, whale transactions, and portfolio changes.
              Stop refreshing apps, get notified where you chat.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="w-full md:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25">
                Start Tracking Free
              </Link>
              <Link href="#demo" className="w-full md:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section >

      {/* Features Grid */}
      < section id="features" className="py-24 bg-black/50" >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything you need to <span className="text-purple-400">stay ahead</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Production-ready features with real blockchain data. No mock data, no simulations.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Multi-Chain Portfolio",
                desc: "Track ETH, BTC, SOL, and BNB balances in real-time. Support for ERC-20 and BEP-20 tokens.",
                icon: "🔗",
                badge: "4 Chains"
              },
              {
                title: "Security Scanner",
                desc: "Real honeypot detection, bytecode analysis, and contract verification. Know before you buy.",
                icon: "🛡️",
                badge: "Live API"
              },
              {
                title: "Whale Watching",
                desc: "Track large transactions across all chains. Get alerted when whales move.",
                icon: "🐋",
                badge: "Real-time"
              },
              {
                title: "AI Sentiment Analysis",
                desc: "Reddit sentiment tracking for top cryptocurrencies. Analyze market mood in real-time.",
                icon: "🤖",
                badge: "AI Powered"
              },
              {
                title: "Copy Trading",
                desc: "Monitor whale wallets and track their trades. Learn from the best traders.",
                icon: "📊",
                badge: "Pro Feature"
              },
              {
                title: "Portfolio Performance",
                desc: "24h/7d/30d performance tracking with automated snapshots and historical data.",
                icon: "📈",
                badge: "Analytics"
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all group relative overflow-hidden">
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                  {feature.badge}
                </div>
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Pricing Section */}
      < section id="pricing" className="py-24" >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                features: ["1 Wallet", "3 Alerts", "Daily Digest"],
                cta: "Get Started",
                highlight: false,
                link: "/signup"
              },
              {
                name: "Premium",
                price: "$29",
                features: [
                  "Unlimited wallets & alerts",
                  "Multi-chain support (ETH, BTC, SOL, BNB)",
                  "ERC-20/BEP-20 token tracking",
                  "🛡️ Security Scanner with honeypot detection",
                  "🤖 AI Sentiment Analysis",
                  "📊 Copy Trading & whale monitoring",
                  "📈 Advanced portfolio analytics",
                  "⚡ Real-time Telegram notifications",
                  "🔔 Whale transaction alerts",
                  "24/7 priority support"
                ],
                cta: "Upgrade to Premium",
                highlight: true,
                link: "/dashboard"
              }
            ].map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-2xl border ${plan.highlight ? 'bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-purple-900/50 border-purple-500/50' : 'border-white/10 bg-white/5'} flex flex-col`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                    Recommended
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300">
                      <svg className={`w-5 h-5 ${plan.highlight ? 'text-green-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.link} className={`w-full py-4 text-center rounded-xl font-bold transition-all ${plan.highlight ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 shadow-lg shadow-purple-500/25' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* FAQ Section */}
      < section className="py-24 bg-black/30" >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <details className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                <summary className="flex items-center justify-between cursor-pointer text-lg font-bold">
                  How do I get started?
                  <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Simply sign up for a free account, connect your wallet addresses, and set up your first price alert. You'll receive notifications via email. Upgrade to Premium to unlock Telegram notifications and unlimited tracking.
                </p>
              </details>

              <details className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                <summary className="flex items-center justify-between cursor-pointer text-lg font-bold">
                  What payment methods do you accept?
                  <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  We accept USDT (TRC20) for Premium subscriptions. Simply send $29 USDT to our wallet address and submit your transaction hash for instant activation.
                </p>
              </details>

              <details className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                <summary className="flex items-center justify-between cursor-pointer text-lg font-bold">
                  Can I cancel my subscription anytime?
                  <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Yes! There are no long-term commitments. Your Premium access remains active until the end of your billing period, and you can choose not to renew.
                </p>
              </details>

              <details className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                <summary className="flex items-center justify-between cursor-pointer text-lg font-bold">
                  Which blockchains do you support?
                  <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Premium members get access to Ethereum (ETH), Bitcoin (BTC), Solana (SOL), and Binance Smart Chain (BSC). We're constantly adding support for more chains.
                </p>
              </details>

              <details className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                <summary className="flex items-center justify-between cursor-pointer text-lg font-bold">
                  Is my data secure?
                  <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Absolutely. We only track public wallet addresses - we never ask for private keys or seed phrases. All data is encrypted and stored securely.
                </p>
              </details>

              <details className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                <summary className="flex items-center justify-between cursor-pointer text-lg font-bold">
                  What makes CryptoMonitor different?
                  <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  We focus on Telegram integration, making it incredibly convenient to stay updated. No need to open multiple apps - get all your crypto alerts where you already chat with friends and communities.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section >

      {/* Final CTA */}
      < section className="py-24 relative overflow-hidden" >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to take control of your crypto?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of traders who never miss a market move.
            </p>
            <Link href="/signup" className="inline-block px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/30">
              Start Free Today →
            </Link>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Upgrade anytime
            </p>
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="border-t border-white/10 py-12 bg-black/50" >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              CryptoMonitor.app
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 CryptoMonitor. All rights reserved.
            </div>
          </div>
        </div>
      </footer >
    </div >
  );
}
