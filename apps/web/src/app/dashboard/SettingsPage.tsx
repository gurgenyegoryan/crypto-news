'use client';

import { useState } from 'react';

interface SettingsPageProps {
    // Profile
    profileName: string;
    profileEmail: string;
    setProfileName: (name: string) => void;
    setProfileEmail: (email: string) => void;
    updateProfile: (name: string, email: string) => void;
    user: any;

    // Password
    passwordChange: { currentPassword: string; newPassword: string; confirmPassword: string };
    setPasswordChange: (change: any) => void;
    handleChangePassword: () => void;
    passwordError: string;
    passwordSuccess: boolean;

    // 2FA
    twoFactorQR: string | null;
    twoFactorCode: string;
    setTwoFactorCode: (code: string) => void;
    twoFactorError: string;
    twoFactorSuccess: string;
    twoFactorLoading: boolean;
    isTwoFactorEnabled: boolean;
    handleGenerate2FA: () => void;
    handleEnable2FA: () => void;
    handleDisable2FA: () => void;

    // Settings/Notifications
    settings: { telegramAlerts: boolean; telegramChatId: string };
    setSettings: (settings: any) => void;
    handleSaveSettings: () => void;
    saveSuccess: boolean;
    isPremium: boolean;

    // Subscription
    subscriptionInfo: { daysRemaining: number; needsRenewal: boolean; premiumUntil: string | null } | null;
    setShowModal: (modal: "alert" | "wallet" | "payment" | null) => void;
}

export default function SettingsPage(props: SettingsPageProps) {
    const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'billing' | 'notifications'>('personal');
    const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);

    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const {
        profileName, profileEmail, setProfileName, setProfileEmail, updateProfile, user,
        passwordChange, setPasswordChange, handleChangePassword, passwordError, passwordSuccess,
        twoFactorQR, twoFactorCode, setTwoFactorCode, twoFactorError, twoFactorSuccess,
        twoFactorLoading, isTwoFactorEnabled, handleGenerate2FA, handleEnable2FA, handleDisable2FA,
        settings, setSettings, handleSaveSettings, saveSuccess, isPremium,
        subscriptionInfo, setShowModal
    } = props;

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            await updateProfile(profileName, profileEmail);
            setSaveProfileSuccess(true);
            setTimeout(() => setSaveProfileSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save profile", error);
            // Ideally show error to user
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-8 border-b border-white/10">
                {[
                    { id: 'personal', label: 'Personal', icon: '👤' },
                    { id: 'security', label: 'Security', icon: '🔒' },
                    { id: 'billing', label: 'Billing', icon: '💳' },
                    { id: 'notifications', label: 'Notifications', icon: '🔔' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${activeTab === tab.id
                            ? 'text-white'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* Personal Tab */}
                {activeTab === 'personal' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="font-bold text-xl mb-6">Profile Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-gray-300 focus:border-purple-500 outline-none transition-colors"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={profileEmail}
                                            onChange={(e) => setProfileEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-gray-300 focus:border-purple-500 outline-none transition-colors"
                                            placeholder="your@email.com"
                                        />
                                        {user?.isVerified && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-400 text-sm">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>Verified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium transition-all"
                                >
                                    {saveProfileSuccess ? '✓ Saved!' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Password Change */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="font-bold text-xl mb-6">Change Password</h3>

                            {passwordError && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                    Password changed successfully!
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordChange.currentPassword}
                                        onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 outline-none focus:border-purple-500 transition-colors"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordChange.newPassword}
                                        onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 outline-none focus:border-purple-500 transition-colors"
                                        placeholder="Enter new password (min 8 characters)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordChange.confirmPassword}
                                        onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 outline-none focus:border-purple-500 transition-colors"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="font-bold text-xl mb-2">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                Add an extra layer of security to your account with Google Authenticator
                            </p>

                            {twoFactorError && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {twoFactorError}
                                </div>
                            )}

                            {twoFactorSuccess && (
                                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                    {twoFactorSuccess}
                                </div>
                            )}

                            {!isTwoFactorEnabled ? (
                                <div className="space-y-4">
                                    {!twoFactorQR ? (
                                        <button
                                            onClick={handleGenerate2FA}
                                            disabled={twoFactorLoading}
                                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {twoFactorLoading ? "Generating..." : "Enable 2FA"}
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-white rounded-lg inline-block">
                                                <img src={twoFactorQR} alt="2FA QR Code" className="w-48 h-48" />
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                Scan this QR code with Google Authenticator app
                                            </p>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Enter 6-digit code</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={twoFactorCode}
                                                        onChange={(e) => setTwoFactorCode(e.target.value)}
                                                        maxLength={6}
                                                        placeholder="000000"
                                                        className="flex-1 px-4 py-3 rounded-lg bg-black/50 border border-white/10 outline-none focus:border-purple-500 text-center tracking-widest text-xl"
                                                    />
                                                    <button
                                                        onClick={handleEnable2FA}
                                                        disabled={twoFactorLoading || twoFactorCode.length !== 6}
                                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        {twoFactorLoading ? "Verifying..." : "Verify & Enable"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">2FA is enabled and protecting your account</span>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Enter 6-digit code to disable</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                                maxLength={6}
                                                placeholder="000000"
                                                className="flex-1 px-4 py-3 rounded-lg bg-black/50 border border-white/10 outline-none focus:border-purple-500 text-center tracking-widest text-xl"
                                            />
                                            <button
                                                onClick={handleDisable2FA}
                                                disabled={twoFactorLoading || twoFactorCode.length !== 6}
                                                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            >
                                                {twoFactorLoading ? "Disabling..." : "Disable 2FA"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Premium Status Card */}
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-purple-900/50 border-2 border-purple-500/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
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

                                {isPremium && subscriptionInfo ? (
                                    <div className="space-y-4">
                                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-400 text-sm">Subscription Status</span>
                                                <span className="text-white font-medium">
                                                    {subscriptionInfo.daysRemaining > 0
                                                        ? `${subscriptionInfo.daysRemaining} day${subscriptionInfo.daysRemaining > 1 ? 's' : ''} remaining`
                                                        : 'Expired'}
                                                </span>
                                            </div>
                                            {subscriptionInfo.premiumUntil && (
                                                <div className="text-sm text-gray-500">
                                                    Expires on: {new Date(subscriptionInfo.premiumUntil).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowModal("payment")}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold transition-all"
                                        >
                                            Renew Subscription
                                        </button>
                                        <p className="text-xs text-gray-500 text-center">
                                            Renewing before expiry extends your subscription from the current end date
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                                            <div className="text-center mb-4">
                                                <div className="text-5xl font-bold text-white mb-2">
                                                    $29<span className="text-2xl text-gray-400">/month</span>
                                                </div>
                                                <p className="text-purple-300 text-sm">Pay with USDT (TRC20) • Cancel anytime</p>
                                            </div>
                                        </div>
                                        <div className="grid gap-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-300">Unlimited price alerts</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-300">Unlimited wallet tracking</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-300">Advanced whale alerts</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-300">Telegram notifications</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-300">Priority support</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowModal("payment")}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg transition-all shadow-lg shadow-purple-500/25"
                                        >
                                            Upgrade to Premium
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-xl mb-1">Telegram Notifications</h3>
                                    <p className="text-sm text-gray-400">
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
                                <div className="pt-4 border-t border-white/10 space-y-4">
                                    <p className="text-sm text-gray-400">
                                        Start a chat with <a href="https://t.me/cryptomonitorappbot" target="_blank" className="text-purple-400 hover:underline">@cryptomonitorappbot</a> and enter your Chat ID below.
                                    </p>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Telegram Chat ID</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. 123456789"
                                                value={settings.telegramChatId}
                                                onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                                                className="flex-1 px-4 py-3 rounded-lg bg-black/50 border border-white/10 focus:border-purple-500 outline-none transition-colors"
                                            />
                                            <button
                                                onClick={handleSaveSettings}
                                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-all"
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
                    </div>
                )}
            </div>

            {/* Add fade-in animation */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
