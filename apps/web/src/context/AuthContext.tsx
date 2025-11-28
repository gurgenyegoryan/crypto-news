"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, twoFactorCode?: string) => Promise<{ success?: boolean; requiresTwoFactor?: boolean }>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    updateProfile: (name: string, email: string) => void;
    resendVerification: () => Promise<void>;
    isAuthenticated: boolean;
    error: string | null;
    loading: boolean;
    generate2FA: () => Promise<{ secret: string; qrCodeUrl: string }>;
    enable2FA: (code: string) => Promise<{ message: string }>;
    disable2FA: (code: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Password validation
function validatePassword(password: string): string | null {
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return "Password must contain at least one special character";
    }
    return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in by checking for token
        const token = localStorage.getItem("auth_token");
        if (token) {
            // Verify token with backend
            fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error('Invalid token');
                    return res.json();
                })
                .then(data => {
                    setUser(data);
                })
                .catch(() => {
                    // Token is invalid, clear it
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("user");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const signup = async (email: string, password: string, name: string) => {
        try {
            setError(null);

            // Validate password
            const passwordError = validatePassword(password);
            if (passwordError) {
                setError(passwordError);
                throw new Error(passwordError);
            }

            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Signup failed');
            }

            const data = await response.json();

            // Save token and user data
            localStorage.setItem("auth_token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const login = async (email: string, password: string, twoFactorCode?: string) => {
        try {
            setError(null);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, twoFactorCode }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid email or password');
            }

            const data = await response.json();

            // Handle 2FA requirement
            if (data.requiresTwoFactor) {
                return { requiresTwoFactor: true };
            }

            // Save token and user data
            localStorage.setItem("auth_token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);

            // Use router.push for SPA navigation
            router.push('/dashboard');
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const generate2FA = async () => {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${API_URL}/auth/2fa/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to generate 2FA');
        return response.json();
    };

    const enable2FA = async (code: string) => {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${API_URL}/auth/2fa/enable`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ code }),
        });
        if (!response.ok) throw new Error('Failed to enable 2FA');

        // Update local user state
        if (user) {
            const updatedUser = { ...user, isTwoFactorEnabled: true };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        return response.json();
    };

    const disable2FA = async (code: string) => {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${API_URL}/auth/2fa/disable`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ code }),
        });
        if (!response.ok) throw new Error('Failed to disable 2FA');

        // Update local user state
        if (user) {
            const updatedUser = { ...user, isTwoFactorEnabled: false };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        return response.json();
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const updateProfile = (name: string, email: string) => {
        if (!user) return;
        const updatedUser = { ...user, name, email };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    const resendVerification = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(`${API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to resend verification email');
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            updateProfile,
            resendVerification,
            isAuthenticated: !!user,
            error,
            loading,
            generate2FA,
            enable2FA,
            disable2FA
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
