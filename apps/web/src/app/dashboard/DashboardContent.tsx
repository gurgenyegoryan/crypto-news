"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import VerificationBanner from "@/components/VerificationBanner";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import SecurityScanner from "@/components/SecurityScanner";
import CopyTrading from "@/components/CopyTrading";

export default function DashboardContent() {
    const [activeTab, setActiveTab] = useState("Portfolio");
    const { user, isAuthenticated, updateProfile } = useAuth();
    const router = useRouter();
    const [showModal, setShowModal] = useState<"alert" | "wallet" | "payment" | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    // State for dynamic data
    const [alerts, setAlerts] = useState<{ id: string; token: string; price: string; active: boolean }[]>([]);
    const [wallets, setWallets] = useState<{ id: string; address: string; label: string; balance?: string; chain?: string }[]>([]);
    const [whaleTransactions, setWhaleTransactions] = useState<{ hash: string; from: string; to: string; value: string; token: string; timestamp: number; chain: string }[]>([]);

    // Form state
    const [newAlert, setNewAlert] = useState({ token: "", price: "", type: "above" as "above" | "below" });
    const [newWallet, setNewWallet] = useState({ address: "", label: "", chain: "ETH" });
    const [paymentTxHash, setPaymentTxHash] = useState("");
    const [isPremium, setIsPremium] = useState(false);

    // Settings state
    const [settings, setSettings] = useState({
        emailNotifications: true,
        telegramAlerts: false,
        telegramChatId: ""
    });

    // Local state for profile editing
    const [profileName, setProfileName] = useState("");
    const [profileEmail, setProfileEmail] = useState("");

    // Support state
    const [supportTickets, setSupportTickets] = useState<{ id: string; name: string; surname: string; email: string; message: string; status: string; createdAt: string }[]>([]);
    const [newTicket, setNewTicket] = useState({ name: "", surname: "", email: "", message: "" });
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api:3000';

    useEffect(() => {
        if (user) {
            setProfileName(user.name);
            setProfileEmail(user.email);
            // Check if user is premium (assuming user object has tier, if not we might need to fetch profile again)
            // For now, let's assume we can fetch the latest user profile
            fetchUserProfile();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIsPremium(data.tier === 'premium');
            }
        } catch (e) {
            console.error("Failed to fetch user profile", e);
        }
    };

    const fetchWallets = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/wallets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWallets(data);
            }
        } catch (e) {
            console.error("Failed to fetch wallets", e);
        }
    };

    const fetchWhaleTransactions = async () => {
        // Public endpoint, but let's use token if needed
        try {
            const res = await fetch(`${API_URL}/whale-watch`);
            if (res.ok) {
                const data = await res.json();
                setWhaleTransactions(data);
            }
        } catch (e) {
            console.error("Failed to fetch whale transactions", e);
        }
    };

    const fetchSupportTickets = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/support/tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSupportTickets(data);
            }
        } catch (e) {
            console.error("Failed to fetch tickets", e);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.message) {
            setNotification({ type: 'error', message: "Message is required" });
            return;
        }
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        const ticketData = {
            ...newTicket,
            name: user?.name || "User",
            surname: "",
            email: user?.email || "",
        };

        try {
            const res = await fetch(`${API_URL}/support/tickets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData)
            });

            if (res.ok) {
                setNotification({ type: 'success', message: "Ticket created successfully" });
                setNewTicket({ name: "", surname: "", email: "", message: "" });
                setShowTicketModal(false);
                fetchSupportTickets();
            } else {
                setNotification({ type: 'error', message: "Failed to create ticket" });
            }
        } catch (e) {
            console.error("Error creating ticket", e);
            setNotification({ type: 'error', message: "Error creating ticket" });
        }
    };
    const handleResolveTicket = async (id: string) => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/support/tickets/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'RESOLVED' })
            });

            if (res.ok) {
                fetchSupportTickets();
                setNotification({ type: 'success', message: "Ticket resolved" });
            } else {
                setNotification({ type: 'error', message: "Failed to resolve ticket" });
            }
        } catch (e) {
            console.error("Error resolving ticket", e);
            setNotification({ type: 'error', message: "Error resolving ticket" });
        }
    };

    // Load data on mount
    useEffect(() => {
        const storedAlerts = localStorage.getItem("user_alerts");
        if (storedAlerts) setAlerts(JSON.parse(storedAlerts));

        if (isAuthenticated) {
            fetchWallets();
            fetchWhaleTransactions();
            fetchSupportTickets();
        }
    }, [isAuthenticated]);

    // Save data when updated
    useEffect(() => {
        localStorage.setItem("user_alerts", JSON.stringify(alerts));
    }, [alerts]);

    // Clear notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleCreateAlert = async () => {
        if (!newAlert.token || !newAlert.price) return;

        const token = localStorage.getItem("auth_token");
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/alerts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: newAlert.token,
                    price: parseFloat(newAlert.price),
                    type: newAlert.type
                })
            });

            if (res.ok) {
                const alertData = await res.json();
                setAlerts([...alerts, { ...alertData, active: true }]);
                setNewAlert({ token: "", price: "", type: "above" });
                setShowModal(null);
                setNotification({ type: 'success', message: "Alert created successfully!" });
            } else {
                const errorData = await res.json();
                const errorMessage = errorData.message || "Failed to create alert";

                // Check if it's a tier limit
                if (errorMessage.includes('Free tier limit') || errorMessage.includes('upgrade to Premium')) {
                    setShowUpgradePrompt(true);
                    setShowModal(null);
                } else {
                    setNotification({ type: 'error', message: errorMessage });
                }
            }
        } catch (e) {
            console.error("Error creating alert", e);
            setNotification({ type: 'error', message: "Error creating alert" });
        }
    };
    const handleAddWallet = async () => {
        if (!newWallet.address) return;

        const token = localStorage.getItem("auth_token");
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/wallets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address: newWallet.address,
                    label: newWallet.label || "My Wallet",
                    chain: newWallet.chain
                })
            });

            if (res.ok) {
                await fetchWallets(); // Refresh list
                setNewWallet({ address: "", label: "", chain: "ETH" });
                setShowModal(null);
                setNotification({ type: 'success', message: "Wallet added successfully!" });
            } else {
                const errorData = await res.json();
                const errorMessage = errorData.message || "Failed to add wallet";

                // Check if it's a tier limit
                if (errorMessage.includes('Free tier limit') || errorMessage.includes('upgrade to Premium')) {
                    setShowUpgradePrompt(true);
                    setShowModal(null);
                } else {
                    setNotification({ type: 'error', message: errorMessage });
                }
            }
        } catch (e) {
            console.error("Error adding wallet", e);
            setNotification({ type: 'error', message: "Error adding wallet" });
        }
    };
    const handleVerifyPayment = async () => {
        if (!paymentTxHash) return;
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/payments/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ txHash: paymentTxHash })
            });

            if (res.ok) {
                const data = await res.json();
                setNotification({ type: 'success', message: data.message });
                setIsPremium(true);
                setShowModal(null);
                setPaymentTxHash("");
            } else {
                setNotification({ type: 'error', message: "Payment verification failed. Please check the hash." });
            }
        } catch (e) {
            console.error("Payment verification error", e);
            setNotification({ type: 'error', message: "Error verifying payment" });
        }
    };
    const handleSaveSettings = () => {
        // Save settings to localStorage
        localStorage.setItem("user_settings", JSON.stringify(settings));

        // Update profile in AuthContext
        updateProfile(profileName, profileEmail);

        // Show success message
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setNotification({ type: 'success', message: "Settings saved successfully!" });
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Portfolio":
                return (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-gray-400 mb-2">Portfolio Value</div>
                                <div className="text-3xl font-bold">
                                    {wallets.length === 0 ? (
                                        <span className="text-gray-600">$0.00</span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </div>
                                <div className="text-gray-500 text-sm mt-2">
                                    {wallets.length === 0 ? 'Add wallets to start tracking' : 'Real-time pricing coming soon'}
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
                                        {wallets.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    No assets found. Add a wallet to track your portfolio.
                                                </td>
                                            </tr>
                                        ) : (
                                            wallets.map((wallet, i) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                                                                {wallet.chain || 'ETH'}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{wallet.label}</div>
                                                                <div className="text-xs text-gray-500">{wallet.chain || 'ETH'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">-</td>
                                                    <td className="px-6 py-4">{wallet.balance || '0.00'}</td>
                                                    <td className="px-6 py-4 font-medium">-</td>
                                                    <td className="px-6 py-4 text-gray-400">-</td>
                                                </tr>
                                            ))
                                        )}
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
                                                onClick={async () => {
                                                    // Optimistic update
                                                    setAlerts(alerts.filter(a => a.id !== alert.id));
                                                    const token = localStorage.getItem("auth_token");
                                                    if (token) {
                                                        try {
                                                            const res = await fetch(`${API_URL}/alerts/${alert.id}`, {
                                                                method: 'DELETE',
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            });
                                                            if (res.ok) {
                                                                setNotification({ type: 'success', message: "Alert deleted successfully!" });
                                                            } else {
                                                                setNotification({ type: 'error', message: "Failed to delete alert." });
                                                                // Revert if delete fails
                                                                fetchSupportTickets(); // Or re-fetch alerts
                                                            }
                                                        } catch (e) {
                                                            console.error("Error deleting alert", e);
                                                            setNotification({ type: 'error', message: "Error deleting alert." });
                                                            fetchSupportTickets(); // Or re-fetch alerts
                                                        }
                                                    }
                                                }}
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
                                        <div className="text-right">
                                            <div className="font-bold text-lg">{wallet.balance ? `${wallet.balance} ETH` : 'Loading...'}</div>
                                            <button
                                                onClick={async () => {
                                                    // Optimistic update
                                                    setWallets(wallets.filter(w => w.id !== wallet.id));
                                                    const token = localStorage.getItem("auth_token");
                                                    if (token) {
                                                        try {
                                                            const res = await fetch(`${API_URL}/wallets/${wallet.id}`, {
                                                                method: 'DELETE',
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            });
                                                            if (res.ok) {
                                                                setNotification({ type: 'success', message: "Wallet removed successfully!" });
                                                            } else {
                                                                setNotification({ type: 'error', message: "Failed to remove wallet." });
                                                                // Revert if delete fails
                                                                fetchWallets();
                                                            }
                                                        } catch (e) {
                                                            console.error("Error removing wallet", e);
                                                            setNotification({ type: 'error', message: "Error removing wallet." });
                                                            fetchWallets();
                                                        }
                                                    }
                                                }}
                                                className="text-xs text-red-400 hover:text-red-300 mt-1"
                                            >
                                                Remove
                                            </button>
                                        </div>
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
                            <div className="text-sm text-gray-400">Live Large Transactions</div>
                        </div>
                        <div className="grid gap-4">
                            {whaleTransactions.map((tx, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
                                            🐋
                                        </div>
                                        <div>
                                            <div className="font-bold">{tx.from} ➔ {tx.to.substring(0, 10)}...</div>
                                            <div className="text-sm text-gray-500 font-mono">{tx.chain} • {new Date(tx.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">{tx.value} {tx.token}</div>
                                        <div className="text-xs text-gray-500">
                                            Hash: {tx.hash.substring(0, 8)}...
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

                            {/* Telegram Integration */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">Telegram Notifications</h3>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {isPremium ? 'Receive real-time alerts on Telegram' : 'Available for Premium members only'}
                                        </p>
                                    </div>
                                    {isPremium ? (
                                        <button
                                            onClick={() => setSettings({ ...settings, telegramAlerts: !settings.telegramAlerts })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.telegramAlerts ? 'bg-purple-600' : 'bg-gray-600'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.telegramAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    ) : (
                                        <span className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded-full text-xs font-medium">
                                            Premium Only
                                        </span>
                                    )}
                                </div>

                                {isPremium && settings.telegramAlerts && (
                                    <div className="pt-4 border-t border-white/10 space-y-3">
                                        <p className="text-sm text-gray-400">
                                            Start a chat with <a href="https://t.me/cryptomonitorappbot" target="_blank" className="text-purple-400 hover:underline">@cryptomonitorappbot</a> and enter your Chat ID below.
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
                                )}

                                {!isPremium && (
                                    <div className="pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => setShowModal("payment")}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold transition-all"
                                        >
                                            Upgrade to Premium
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Premium Membership Section */}
                            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-purple-900/50 border-2 border-purple-500/30 space-y-6 relative overflow-hidden">
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-2xl text-white">Premium Membership</h3>
                                                <p className="text-sm text-purple-300">Unlock the full power of CryptoMonitor</p>
                                            </div>
                                        </div>
                                        {isPremium ? (
                                            <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full text-sm shadow-lg">
                                                ✓ ACTIVE
                                            </span>
                                        ) : (
                                            <span className="px-4 py-2 bg-slate-700/50 text-slate-300 font-bold rounded-full text-sm">
                                                FREE TIER
                                            </span>
                                        )}
                                    </div>

                                    {!isPremium && (
                                        <>
                                            {/* Pricing */}
                                            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-500/20">
                                                <div className="text-center mb-4">
                                                    <div className="text-5xl font-bold text-white mb-2">
                                                        $29<span className="text-2xl text-gray-400">/month</span>
                                                    </div>
                                                    <p className="text-purple-300 text-sm">Pay with USDT (TRC20) • Cancel anytime</p>
                                                </div>
                                            </div>

                                            {/* Features Comparison */}
                                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                                <div className="space-y-3">
                                                    <div className="text-sm font-bold text-purple-300 uppercase tracking-wide mb-3">Free Tier</div>
                                                    <div className="flex items-start gap-2 text-sm text-gray-400">
                                                        <span className="text-red-400">✗</span>
                                                        <span>1 Price Alert only</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-sm text-gray-400">
                                                        <span className="text-red-400">✗</span>
                                                        <span>1 Wallet tracking only</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-sm text-gray-400">
                                                        <span className="text-red-400">✗</span>
                                                        <span>Basic whale alerts</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-sm text-gray-400">
                                                        <span className="text-red-400">✗</span>
                                                        <span>Email support only</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                                                    <div className="text-sm font-bold text-purple-300 uppercase tracking-wide mb-3">Premium</div>
                                                    <div className="flex items-start gap-2 text-sm text-white">
                                                        <span className="text-green-400">✓</span>
                                                        <span><strong>Unlimited</strong> price alerts</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-sm text-white">
                                                        <span className="text-green-400">✓</span>
                                                        <span><strong>Unlimited</strong> wallet tracking</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-sm text-white">
                                                        <span className="text-green-400">✓</span>
                                                        <span><strong>Real-time</strong> whale transaction alerts</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-sm text-white">
                                                        <span className="text-green-400">✓</span>
                                                        <span><strong>Multi-chain</strong> support (ETH, BTC, SOL, BSC)</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-sm text-white">
                                                        <span className="text-green-400">✓</span>
                                                        <span><strong>Advanced</strong> portfolio analytics</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-sm text-white">
                                                        <span className="text-green-400">✓</span>
                                                        <span><strong>Priority</strong> Telegram notifications</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-sm text-white">
                                                        <span className="text-green-400">✓</span>
                                                        <span><strong>24/7</strong> priority support</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                onClick={() => setShowModal("payment")}
                                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 font-bold text-lg transition-all shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transform hover:scale-[1.02]"
                                            >
                                                🚀 Upgrade to Premium Now
                                            </button>
                                            <p className="text-center text-xs text-gray-400 mt-3">
                                                Secure payment via USDT (TRC20) • Instant activation
                                            </p>
                                        </>
                                    )}

                                    {isPremium && (
                                        <div className="text-center py-8">
                                            <div className="text-6xl mb-4">🎉</div>
                                            <p className="text-xl text-white font-bold mb-2">You're a Premium Member!</p>
                                            <p className="text-gray-300">Enjoy unlimited access to all features</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "Sentiment":
                return <SentimentAnalysis />;
            case "Security":
                return <SecurityScanner />;
            case "Copy Trading":
                return <CopyTrading />;
            case "Support":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Support Tickets</h2>
                            <button
                                onClick={() => setShowTicketModal(true)}
                                className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-500"
                            >
                                + New Ticket
                            </button>
                        </div>

                        {supportTickets.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl mb-4">🎫</div>
                                <h2 className="text-xl font-bold text-white mb-2">No Tickets Found</h2>
                                <p>Need help? Create a support ticket.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {supportTickets.map((ticket) => (
                                    <div key={ticket.id} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    {ticket.status}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(ticket.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            {ticket.status === 'OPEN' && (
                                                <button
                                                    onClick={() => handleResolveTicket(ticket.id)}
                                                    className="text-sm text-purple-400 hover:text-purple-300"
                                                >
                                                    Mark as Resolved
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-gray-300 whitespace-pre-wrap">{ticket.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                        { name: "Sentiment", icon: "🧠" },
                        { name: "Security", icon: "🛡️" },
                        { name: "Copy Trading", icon: "📋" },
                        { name: "Settings", icon: "⚙️" },
                        { name: "Support", icon: "🎫" },
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

                <div className="p-4 border-t border-white/10 relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user?.name || "User"}</div>
                            <div className="text-xs text-gray-500">{user?.email || "Free Plan"}</div>
                        </div>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>

                    {showUserMenu && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                            <button
                                onClick={() => {
                                    localStorage.removeItem("auth_token");
                                    window.location.href = '/login';
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/5 transition-all text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    )}
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
                                {showModal === "alert" ? "Create New Alert" : showModal === "wallet" ? "Add Wallet" : "Upgrade to Premium"}
                            </h2>

                            <div className="space-y-4">
                                {showModal === "alert" ? (
                                    <>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Token</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. ETH, BTC, SOL"
                                                value={newAlert.token}
                                                onChange={(e) => setNewAlert({ ...newAlert, token: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Condition</label>
                                            <select
                                                value={newAlert.type}
                                                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as 'above' | 'below' })}
                                                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-white/10 outline-none focus:border-purple-500 text-white"
                                            >
                                                <option value="above" className="bg-slate-800 text-white">Price goes ABOVE</option>
                                                <option value="below" className="bg-slate-800 text-white">Price goes BELOW</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Target Price ($)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 3000"
                                                value={newAlert.price}
                                                onChange={(e) => setNewAlert({ ...newAlert, price: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-purple-500"
                                            />
                                        </div>
                                    </>
                                ) : showModal === "wallet" ? (
                                    <>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Token to Track</label>
                                            <select
                                                value={newWallet.chain}
                                                onChange={(e) => setNewWallet({ ...newWallet, chain: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-white/10 outline-none focus:border-purple-500 text-white"
                                            >
                                                <option value="ETH" className="bg-slate-800 text-white">Ethereum (ETH)</option>
                                                <option value="BTC" className="bg-slate-800 text-white">Bitcoin (BTC)</option>
                                                <option value="USDT" className="bg-slate-800 text-white">Tether (USDT)</option>
                                                <option value="SOL" className="bg-slate-800 text-white">Solana (SOL)</option>
                                            </select>
                                        </div>
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
                                ) : (
                                    <>
                                        {/* Payment Instructions */}
                                        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/30 rounded-xl p-6 space-y-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    1
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">Send Payment</h3>
                                                    <p className="text-sm text-gray-400">Transfer USDT to activate Premium</p>
                                                </div>
                                            </div>

                                            <div className="bg-black/40 rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Amount:</span>
                                                    <span className="font-bold text-xl text-white">29 USDT</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Network:</span>
                                                    <span className="font-medium text-purple-300">Tron (TRC20)</span>
                                                </div>
                                                <div className="border-t border-white/10 pt-3">
                                                    <span className="text-gray-400 text-xs block mb-2">Wallet Address:</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 font-mono bg-black/50 p-3 rounded text-xs break-all text-purple-300 border border-purple-500/30">
                                                            TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText('TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29');
                                                                setNotification({ type: 'success', message: 'Address copied!' });
                                                            }}
                                                            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
                                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span>⚠️ Important: Send exactly 29 USDT on <strong>Tron network (TRC20)</strong> only. Do NOT use ERC20, BEP20, or other networks - your funds will be lost!</span>
                                            </div>
                                        </div>

                                        {/* Transaction Hash Input */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    2
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">Enter Transaction Hash</h3>
                                                    <p className="text-sm text-gray-400">Paste your transaction hash below</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Transaction Hash (TxHash)</label>
                                                <input
                                                    type="text"
                                                    placeholder="0x..."
                                                    value={paymentTxHash}
                                                    onChange={(e) => setPaymentTxHash(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 outline-none focus:border-purple-500 font-mono text-sm"
                                                />
                                                <p className="text-xs text-gray-500 mt-2">
                                                    You can find this in your wallet after sending the transaction
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button
                                    onClick={showModal === "alert" ? handleCreateAlert : showModal === "wallet" ? handleAddWallet : handleVerifyPayment}
                                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold transition-all"
                                >
                                    {showModal === "alert" ? "Set Alert" : showModal === "wallet" ? "Connect Wallet" : "Verify Payment"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Support Ticket Modal */}
                {showTicketModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 relative">
                            <button
                                onClick={() => setShowTicketModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                            <h2 className="text-xl font-bold mb-4">New Support Ticket</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Message</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Describe your issue..."
                                        value={newTicket.message}
                                        onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-purple-500 resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateTicket}
                                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold transition-all"
                                >
                                    Submit Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upgrade Prompt Modal */}
                {showUpgradePrompt && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/30 shadow-2xl">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Free Tier Limit Reached</h3>
                                <p className="text-slate-300 mb-6">
                                    You've reached the limit for your free plan. Upgrade to Premium to unlock unlimited alerts, wallets, and more features!
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowUpgradePrompt(false)}
                                        className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 font-medium transition-all"
                                    >
                                        Maybe Later
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowUpgradePrompt(false);
                                            setActiveTab('Settings');
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold transition-all shadow-lg shadow-purple-500/30"
                                    >
                                        Upgrade to Premium
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
