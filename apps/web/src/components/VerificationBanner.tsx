"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function VerificationBanner() {
    const { user, resendVerification } = useAuth();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    if (!user || user.isVerified) return null;

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
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                            <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-yellow-200 font-medium mb-1">📧 Please verify your email address</p>
                            <p className="text-yellow-200/70 text-sm">
                                We've sent a verification email to <span className="font-medium text-yellow-200">{user.email}</span>.
                                Please check your inbox and click the verification link to activate your account.
                            </p>
                            <p className="text-yellow-200/60 text-xs mt-1">
                                Some features are restricted until you verify your account.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                        {error && <span className="text-red-400 text-sm">{error}</span>}
                        {sent && <span className="text-green-400 text-sm">✓ Email sent!</span>}

                        <button
                            onClick={handleResend}
                            disabled={sending || sent}
                            className="px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {sending ? "Sending..." : "Resend Email"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
