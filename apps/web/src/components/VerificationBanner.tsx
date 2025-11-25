"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function VerificationBanner() {
    const { user, resendVerification } = useAuth();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [dismissed, setDismissed] = useState(false);

    if (!user || user.isVerified || dismissed) return null;

    const handleResend = async () => {
        setSending(true);
        setError("");
        try {
            await resendVerification();
            setSent(true);
            setTimeout(() => setSent(false), 5000);
        } catch (err: any) {
            setError(err.message || "Failed to send email");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-gradient-x" />

            {/* Glassmorphism effect */}
            <div className="relative backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-6">
                        {/* Left: Icon + Content */}
                        <div className="flex items-start gap-4 flex-1">
                            {/* Animated icon */}
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl animate-pulse" />
                                <div className="relative p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-semibold text-white">Email Verification Required</h3>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                                        Action Needed
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    We've sent a verification link to{" "}
                                    <span className="font-medium text-white">{user.email}</span>.
                                    Please check your inbox to unlock all features.
                                </p>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Status messages */}
                            {error && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-xs text-red-300">{error}</span>
                                </div>
                            )}
                            {sent && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in">
                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-xs text-green-300 font-medium">Email sent!</span>
                                </div>
                            )}

                            {/* Resend button */}
                            <button
                                onClick={handleResend}
                                disabled={sending || sent}
                                className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 hover:border-blue-500/50 text-sm font-medium text-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/20 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <span className="relative flex items-center gap-2">
                                    {sending ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Resend Email
                                        </>
                                    )}
                                </span>
                            </button>

                            {/* Dismiss button */}
                            <button
                                onClick={() => setDismissed(true)}
                                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                                title="Dismiss"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
