"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import VerificationBanner from "@/components/VerificationBanner";

export default function DashboardContent() {
    const [activeTab, setActiveTab] = useState("Portfolio");
    const { user, isAuthenticated, updateProfile } = useAuth();
    const router = useRouter();
    const [showModal, setShowModal] = useState<"alert" | "wallet" | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    // State for dynamic data
    const [alerts, setAlerts] = useState<{ id: string; token: string; price: string; active: boolean }[]>([]);
    const [wallets, setWallets] = useState<{ id: string; address: string; label: string }[]>([]);

    // Form state
    const [newAlert, setNewAlert] = useState({ token: "", price: "" });
    const [newWallet, setNewWallet] = useState({ address: "", label: "" });

    // Settings state
    const [settings, setSettings] = useState({
        emailNotifications: true,
        telegramAlerts: false,
        telegramChatId: ""
    });

    // Local state for profile editing
    const [profileName, setProfileName] = useState("");
    const [profileEmail, setProfileEmail] = useState("");

    useEffect(() => {
        if (user) {
            setProfileName(user.name);
            setProfileEmail(user.email);
        }
    }, [user]);

    // Load settings
    useEffect(() => {
        const storedSettings = localStorage.getItem("user_settings");
        if (storedSettings) setSettings(JSON.parse(storedSettings));
    }, []);

    // Save settings
    useEffect(() => {
        localStorage.setItem("user_settings", JSON.stringify(settings));
    }, [settings]);

    // Load data from localStorage on mount
    useEffect(() => {
        const storedAlerts = localStorage.getItem("user_alerts");
        const storedWallets = localStorage.getItem("user_wallets");
        if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
        if (storedWallets) setWallets(JSON.parse(storedWallets));
    }, []);

    // Save data when updated
    useEffect(() => {
        localStorage.setItem("user_alerts", JSON.stringify(alerts));
    }, [alerts]);

    useEffect(() => {
        localStorage.setItem("user_wallets", JSON.stringify(wallets));
    }, [wallets]);

    const handleCreateAlert = () => {
        if (!newAlert.token || !newAlert.price) return;
        const alert = { id: Date.now().toString(), token: newAlert.token, price: newAlert.price, active: true };
        setAlerts([...alerts, alert]);
        setNewAlert({ token: "", price: "" });
        setShowModal(null);
    };

    const handleAddWallet = () => {
        if (!newWallet.address) return;
        const wallet = { id: Date.now().toString(), address: newWallet.address, label: newWallet.label || "My Wallet" };
        setWallets([...wallets, wallet]);
        setNewWallet({ address: "", label: "" });
        setShowModal(null);
    };

    const handleSaveSettings = () => {
        // Save settings to localStorage
        localStorage.setItem("user_settings", JSON.stringify(settings));

        // Update profile in AuthContext
        updateProfile(profileName, profileEmail);

        // Show success message
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Portfolio":
                return (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-gray-400 mb-2">Net Worth</div>
                                <div className="text-3xl font-bold">$12,450.32</div>
                                <div className="text-green-400 text-sm mt-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                    +2.4% (24h)
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-gray-400 mb-2">Active Alerts</div>
                                <div className="text-3xl font-bold">{alerts.length}</div>
                                <div className="text-purple-400 text-sm mt-2">{alerts.filter(a => a.active).length} active</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-gray-400 mb-2">Tracked Wallets</div>
                                <div className="text-3xl font-bold">{wallets.length}</div>
                                <div className="text-gray-500 text-sm mt-2">Personal Wallets</div>
                            </div>
                        </div>

                        {/* Asset Table */}
                        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <h2 className="font-bold">Assets</h2>
                                <button
                                    onClick={() => setActiveTab("Wallets")}
                                    className="text-sm text-purple-400 hover:text-purple-300"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-gray-400 text-sm">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Asset</th>
                                            <th className="px-6 py-3 font-medium">Price</th>
                                            <th className="px-6 py-3 font-medium">Balance</th>
                                            <th className="px-6 py-3 font-medium">Value</th>
                                            <th className="px-6 py-3 font-medium">24h</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {[
                                            { name: "Ethereum", symbol: "ETH", price: "$3,020.50", balance: "2.5", value: "$7,551.25", change: "+1.2%" },
                                            { name: "Solana", symbol: "SOL", price: "$145.20", balance: "45", value: "$6,534.00", change: "+5.4%" },
                                            { name: "USDC", symbol: "USDC", price: "$1.00", balance: "1,200", value: "$1,200.00", change: "0.0%" },
                                        ].map((asset, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                                                            {asset.symbol[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{asset.name}</div>
                                                            <div className="text-xs text-gray-500">{asset.symbol}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{asset.price}</td>
                                                <td className="px-6 py-4">{asset.balance}</td>
                                                <td className="px-6 py-4 font-medium">{asset.value}</td>
                                                <td className={`px-6 py-4 ${asset.change.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
                                                    {asset.change}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case "Alerts":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Alerts</h2>
                            <button
                                onClick={() => setShowModal("alert")}
                                className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-500"
                            >
                                + Create Alert
                            </button>
                        </div>

                        {alerts.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl mb-4">🔔</div>
                                <h2 className="text-xl font-bold text-white mb-2">No Alerts Configured</h2>
                                <p>Create your first price alert to stay updated.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
                                                🔔
                                            </div>
                                            <div>
                                                <div className="font-bold">{alert.token}</div>
                                                <div className="text-sm text-gray-500">Target: ${alert.price}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-xs ${alert.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {alert.active ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case "Wallets":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Wallets</h2>
                            <button
                                onClick={() => setShowModal("wallet")}
                                className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-500"
                            >
                                + Add Wallet
                            </button>
                        </div>

                        {wallets.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl mb-4">👛</div>
                                <h2 className="text-xl font-bold text-white mb-2">No Wallets Connected</h2>
                                <p>Add a wallet to start tracking your portfolio.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {wallets.map((wallet) => (
                                    <div key={wallet.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
                                                👛
                                            </div>
                                            <div>
                                                <div className="font-bold">{wallet.label}</div>
                                                <div className="text-sm text-gray-500 font-mono">{wallet.address}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setWallets(wallets.filter(w => w.id !== wallet.id))}
                                            className="text-gray-400 hover:text-red-400"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case "Whale Watch":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Whale Watch</h2>
                            <button
                                onClick={() => setShowModal("wallet")}
                                className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-500"
                            >
                                + Track New Wallet
                            </button>
                        </div>
                        <div className="grid gap-4">
                            {[
                                { label: "Vitalik.eth", address: "0xd8dA...6031", balance: "$452.1M", change: "+1.2%" },
                                { label: "Binance Cold Wallet", address: "0x47ac...3d8e", balance: "$2.1B", change: "-0.5%" },
                                { label: "Justin Sun", address: "0x3Ddc...921f", balance: "$125.4M", change: "+3.4%" },
                            ].map((whale, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
                                            🐋
                                        </div>
                                        <div>
                                            <div className="font-bold">{whale.label}</div>
                                            <div className="text-sm text-gray-500 font-mono">{whale.address}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">{whale.balance}</div>
                                        <div className={whale.change.startsWith('+') ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                                            {whale.change} (24h)
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "Settings":
                return (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

                        <div className="space-y-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                <h3 className="font-bold text-lg">Profile</h3>
                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={profileName}
                                            onChange={(e) => setProfileName(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-gray-300 focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                                        <input
                                            type="text"
                                            value={profileEmail}
                                            onChange={(e) => setProfileEmail(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-gray-300 focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ... (keep Preferences) ... */}

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                <h3 className="font-bold text-lg">Telegram Integration</h3>
                                <p className="text-sm text-gray-400">
                                    To receive alerts, start a chat with <a href="https://t.me/cryptomonitorappbot" target="_blank" className="text-purple-400 hover:underline">@cryptomonitorappbot</a> and enter your Chat ID below.
                                </p>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Telegram Chat ID</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. 123456789"
                                            value={settings.telegramChatId}
                                            onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                                            className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-white/10 focus:border-purple-500 outline-none"
                                        />
                                        <button
                                            onClick={handleSaveSettings}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-all"
                                        >
                                            {saveSuccess ? "Saved!" : "Save"}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Don't know your Chat ID? Message <a href="https://t.me/userinfobot" target="_blank" className="text-purple-400 hover:underline">@userinfobot</a> on Telegram to get it.
                                    </p>
                                </div>
                            </div>

                            <button onClick={() => window.location.href = '/login'} className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold transition-all">
                                Sign Out
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div className="p-8">Coming Soon</div>;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex" suppressHydrationWarning>
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl fixed h-full hidden md:flex flex-col z-50">
                <div className="p-6">
                    <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        CryptoMonitor
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { name: "Portfolio", icon: "📊" },
                        { name: "Alerts", icon: "🔔" },
                        { name: "Wallets", icon: "👛" },
                        { name: "Whale Watch", icon: "🐋" },
                        { name: "Settings", icon: "⚙️" },
                    ].map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.name
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user?.name || "User"}</div>
                            <div className="text-xs text-gray-500">{user?.email || "Free Plan"}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 overflow-y-auto relative">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-lg sticky top-0 z-10">
                    <h1 className="text-xl font-bold">{activeTab} Overview</h1>
                    <button className="md:hidden p-2 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </header>

                <VerificationBanner />

                <div className="p-8 max-w-7xl mx-auto">
                    {renderContent()}
                </div>

                {/* Modals */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 relative">
                            <button
                                onClick={() => setShowModal(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>

                            <h2 className="text-xl font-bold mb-4">
                                {showModal === "alert" ? "Create New Alert" : "Add Wallet"}
                            </h2>

                            <div className="space-y-4">
                                {showModal === "alert" ? (
                                    <>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Token</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. ETH"
                                                value={newAlert.token}
                                                onChange={(e) => setNewAlert({ ...newAlert, token: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Target Price</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 3000"
                                                value={newAlert.price}
                                                onChange={(e) => setNewAlert({ ...newAlert, price: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-purple-500"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Wallet Address</label>
                                            <input
                                                type="text"
                                                placeholder="0x..."
                                                value={newWallet.address}
                                                onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Label</label>
                                            <input
                                                type="text"
                                                placeholder="My Main Wallet"
                                                value={newWallet.label}
                                                onChange={(e) => setNewWallet({ ...newWallet, label: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-purple-500"
                                            />
                                        </div>
                                    </>
                                )}

                                <button
                                    onClick={showModal === "alert" ? handleCreateAlert : handleAddWallet}
                                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold transition-all"
                                >
                                    {showModal === "alert" ? "Set Alert" : "Connect Wallet"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
