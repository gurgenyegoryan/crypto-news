import Link from "next/link";

export default function PrivacyPage() {
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
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-gray-400 mb-12">Last updated: November 25, 2025</p>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p className="mb-4">We collect the following types of information:</p>

                        <h3 className="text-xl font-bold text-white mb-2 mt-4">Account Information</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Email address</li>
                            <li>Name (optional)</li>
                            <li>Password (encrypted)</li>
                            <li>Telegram Chat ID (for Premium users who enable notifications)</li>
                        </ul>

                        <h3 className="text-xl font-bold text-white mb-2 mt-4">Wallet Information</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Public wallet addresses you choose to track</li>
                            <li>Wallet labels you assign</li>
                            <li>Blockchain network selection</li>
                        </ul>

                        <h3 className="text-xl font-bold text-white mb-2 mt-4">Usage Data</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Price alerts you create</li>
                            <li>Support tickets and communications</li>
                            <li>Payment transaction hashes (for Premium verification)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <p className="mb-4">We use your information to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Provide and maintain the Service</li>
                            <li>Send you price alerts and whale transaction notifications</li>
                            <li>Process your Premium subscription payments</li>
                            <li>Respond to your support requests</li>
                            <li>Send important service updates and security alerts</li>
                            <li>Improve and optimize the Service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your data:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                            <li>All passwords are hashed using bcrypt</li>
                            <li>Data is encrypted in transit using HTTPS/TLS</li>
                            <li>Database access is restricted and monitored</li>
                            <li>We never store private keys or seed phrases</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Sharing</h2>
                        <p className="mb-4">
                            We do not sell your personal information. We may share data only in these limited circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., email delivery, blockchain data providers)</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In the event of a merger or acquisition</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking</h2>
                        <p>
                            We use essential cookies to maintain your session and provide the Service. We do not use third-party advertising cookies. You can disable cookies in your browser, but this may affect Service functionality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                        <p className="mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your account and data</li>
                            <li>Export your data</li>
                            <li>Opt-out of non-essential communications</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, contact us at <a href="mailto:support@cryptomonitor.app" className="text-purple-400 hover:underline">support@cryptomonitor.app</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
                        <p>
                            We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. International Data Transfers</h2>
                        <p>
                            Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
                        <p>
                            Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on the Service. Your continued use of the Service after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <p className="mt-4">
                            Email: <a href="mailto:support@cryptomonitor.app" className="text-purple-400 hover:underline">support@cryptomonitor.app</a>
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
