"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link");
            return;
        }

        const verifyEmail = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api:3000';
                const response = await fetch(`${API_URL}/auth/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Verification failed');
                }

                setStatus("success");
                setMessage(data.message || "Email verified successfully!");

                // Update local storage user if logged in
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    user.isVerified = true;
                    localStorage.setItem("user", JSON.stringify(user));
                }

                setTimeout(() => {
                    router.push("/dashboard");
                }, 3000);
            } catch (err: any) {
                setStatus("error");
                setMessage(err.message || "Verification failed");
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

            <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center">
                <div className="mb-6 flex justify-center">
                    {status === "loading" && (
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {status === "success" && (
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold mb-2">
                    {status === "loading" && "Verifying..."}
                    {status === "success" && "Email Verified!"}
                    {status === "error" && "Verification Failed"}
                </h1>

                <p className="text-gray-400 mb-8">{message}</p>

                {status === "success" && (
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                )}

                {status === "error" && (
                    <Link href="/dashboard" className="inline-block py-2 px-6 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                        Go to Dashboard
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
