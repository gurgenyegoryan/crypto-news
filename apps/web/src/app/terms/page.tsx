import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        CryptoMonitor.app
                    </Link>
                    <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
                <p className="text-gray-400 mb-12">Last updated: November 25, 2025</p>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using CryptoMonitor.app ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                        <p>
                            CryptoMonitor.app provides cryptocurrency portfolio tracking, price alerts, and whale transaction monitoring services. The Service includes both free and premium subscription tiers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                        <p className="mb-4">
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Provide accurate and complete information during registration</li>
                            <li>Keep your password secure and confidential</li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                            <li>Not share your account with others</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Premium Subscriptions</h2>
                        <p className="mb-4">
                            Premium subscriptions are billed monthly at $1 USD (paid in USDT via TRC20 or Polygon). By subscribing to Premium:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>You authorize us to charge the subscription fee each billing period</li>
                            <li>Subscriptions automatically renew unless cancelled</li>
                            <li>No refunds are provided for partial months</li>
                            <li>You may cancel at any time, with access continuing until the end of the billing period</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
                        <p className="mb-4">
                            You agree not to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Use the Service for any illegal purposes</li>
                            <li>Attempt to gain unauthorized access to the Service or related systems</li>
                            <li>Interfere with or disrupt the Service or servers</li>
                            <li>Use automated systems to access the Service without permission</li>
                            <li>Resell or redistribute the Service without authorization</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Data and Privacy</h2>
                        <p>
                            We collect and process data as described in our <Link href="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>. We only track public blockchain addresses and never request private keys or seed phrases.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimer of Warranties</h2>
                        <p className="mb-4">
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Accuracy of cryptocurrency prices or data</li>
                            <li>Uninterrupted or error-free service</li>
                            <li>That the Service will meet your specific requirements</li>
                            <li>Investment advice or recommendations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
                        <p>
                            CryptoMonitor.app shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. This includes but is not limited to financial losses from trading decisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Modifications to Service</h2>
                        <p>
                            We reserve the right to modify or discontinue the Service at any time, with or without notice. We may also modify these Terms of Service, and will notify users of significant changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
                        <p>
                            We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
                        <p>
                            For questions about these Terms of Service, please contact us at: <a href="mailto:support@cryptomonitor.app" className="text-purple-400 hover:underline">support@cryptomonitor.app</a>
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10">
                    <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
