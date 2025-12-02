"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.cryptomonitor.app";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!token) {
            setError("Invalid reset token");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/login"), 3000);
            } else {
                setError(data.message || "Failed to reset password");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: "", color: "" };
        if (password.length < 6) return { strength: 25, label: "Weak", color: "bg-red-500" };
        if (password.length < 10) return { strength: 50, label: "Fair", color: "bg-yellow-500" };
        if (password.length < 14) return { strength: 75, label: "Good", color: "bg-blue-500" };
        return { strength: 100, label: "Strong", color: "bg-green-500" };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
                <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Password Reset Successful!</h2>
                    <p className="text-gray-400 mb-4">Redirecting you to login...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

            <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                        <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                    <p className="text-gray-400">Enter your new password below</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                            disabled={loading || !token}
                            minLength={6}
                        />
                        {newPassword && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-500">Password Strength</span>
                                    <span className={`font-semibold ${passwordStrength.strength >= 75 ? 'text-green-400' : passwordStrength.strength >= 50 ? 'text-blue-400' : 'text-red-400'}`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{ width: `${passwordStrength.strength}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                            disabled={loading || !token}
                        />
                        {confirmPassword && confirmPassword !== newPassword && (
                            <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token || newPassword !== confirmPassword}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-sm text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
