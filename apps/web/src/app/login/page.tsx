"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const { login, error, isAuthenticated } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setLocalError("Please enter both email and password");
            return;
        }

        setLoading(true);
        setLocalError("");

        try {
            const result = await login(email, password, twoFactorCode);
            if (result && result.requiresTwoFactor) {
                setRequiresTwoFactor(true);
                setLocalError(""); // Clear any previous errors
            }
        } catch (err: any) {
            setLocalError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

            <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>

                {(localError || error) && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    {!requiresTwoFactor ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Two-Factor Code</label>
                            <input
                                type="text"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-center tracking-widest text-2xl"
                                placeholder="000000"
                                maxLength={6}
                                required
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Enter the 6-digit code from your authenticator app
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Verifying..." : (requiresTwoFactor ? "Verify Code" : "Sign In")}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-purple-400 hover:text-purple-300">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
