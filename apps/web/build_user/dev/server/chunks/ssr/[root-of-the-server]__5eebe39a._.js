module.exports = [
    "[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("fs", () => require("fs"));

        module.exports = mod;
    }),
    "[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("url", () => require("url"));

        module.exports = mod;
    }),
    "[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("child_process", () => require("child_process"));

        module.exports = mod;
    }),
    "[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("http", () => require("http"));

        module.exports = mod;
    }),
    "[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("https", () => require("https"));

        module.exports = mod;
    }),
    "[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("tty", () => require("tty"));

        module.exports = mod;
    }),
    "[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("util", () => require("util"));

        module.exports = mod;
    }),
    "[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("os", () => require("os"));

        module.exports = mod;
    }),
    "[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("stream", () => require("stream"));

        module.exports = mod;
    }),
    "[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("zlib", () => require("zlib"));

        module.exports = mod;
    }),
    "[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("buffer", () => require("buffer"));

        module.exports = mod;
    }),
    "[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("crypto", () => require("crypto"));

        module.exports = mod;
    }),
    "[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("events", () => require("events"));

        module.exports = mod;
    }),
    "[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("net", () => require("net"));

        module.exports = mod;
    }),
    "[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

        const mod = __turbopack_context__.x("tls", () => require("tls"));

        module.exports = mod;
    }),
    "[project]/src/hooks/useRealtime.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
        "use strict";

        __turbopack_context__.s([
            "useRealtime",
            () => useRealtime
        ]);
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2d$debug$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm-debug/index.js [app-ssr] (ecmascript) <locals>");
        ;
        ;
        const SOCKET_URL = ("TURBOPACK compile-time value", "http://https://api.cryptomonitor.app") || 'http://https://api.cryptomonitor.app';
        const useRealtime = () => {
            const socketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
            const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(() => {
                const token = localStorage.getItem('auth_token');
                // Don't attempt to connect if there is no token
                if (!token) {
                    return;
                }
                // Connect to the 'events' namespace
                socketRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2d$debug$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])(`${SOCKET_URL}/events`, {
                    auth: {
                        token: `Bearer ${token}`
                    },
                    query: {
                        token: token
                    },
                    transports: [
                        'websocket'
                    ],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 3000
                });
                socketRef.current.on('connect', () => {
                    console.log('Connected to WebSocket');
                    setIsConnected(true);
                });
                socketRef.current.on('disconnect', () => {
                    console.log('Disconnected from WebSocket');
                    setIsConnected(false);
                });
                socketRef.current.on('connect_error', (err) => {
                    // Suppress 403 errors to keep console clean, as they are expected when auth fails
                    if (err.message.includes('403') || err.data?.code === 403) {
                        console.warn('WebSocket auth failed (403). This is expected if session expired.');
                    } else {
                        console.error('WebSocket connection error:', err.message);
                    }
                    setIsConnected(false);
                });
                return () => {
                    if (socketRef.current) {
                        socketRef.current.disconnect();
                    }
                };
            }, []);
            const subscribeToTicker = (tokens) => {
                if (socketRef.current && isConnected) {
                    socketRef.current.emit('subscribeToTicker', tokens);
                }
            };
            const unsubscribeFromTicker = (tokens) => {
                if (socketRef.current && isConnected) {
                    socketRef.current.emit('unsubscribeFromTicker', tokens);
                }
            };
            return {
                socket: socketRef.current,
                isConnected,
                subscribeToTicker,
                unsubscribeFromTicker
            };
        };
    }),
    "[project]/src/components/LivePriceTicker.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
        "use strict";

        __turbopack_context__.s([
            "default",
            () => LivePriceTicker
        ]);
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useRealtime.ts [app-ssr] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-down.js [app-ssr] (ecmascript) <export default as TrendingDown>");
        "use client";
        ;
        ;
        ;
        ;
        ;
        function LivePriceTicker() {
            const { socket, isConnected, subscribeToTicker } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRealtime"])();
            const [prices, setPrices] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Map());
            // Initial tokens to track
            const tokens = [
                'BTC',
                'ETH',
                'BNB',
                'SOL',
                'XRP',
                'ADA',
                'DOGE',
                'DOT'
            ];
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(() => {
                if (isConnected && socket) {
                    // Subscribe to updates
                    subscribeToTicker(tokens);
                    // Listen for updates
                    socket.on('tickerUpdate', (data) => {
                        setPrices((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(data.token, data);
                            return newMap;
                        });
                    });
                    return () => {
                        socket.off('tickerUpdate');
                    };
                }
            }, [
                isConnected,
                socket
            ]);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-da173eb05ee18632" + " " + "w-full bg-black/80 border-b border-white/10 overflow-hidden py-2",
                children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-da173eb05ee18632" + " " + "flex items-center gap-8 animate-scroll whitespace-nowrap",
                    children: [
                        ...tokens,
                        ...tokens
                    ].map((token, i) => {
                        const data = prices.get(token);
                        const price = data?.price || 0;
                        const isPositive = (data?.change24h || 0) >= 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-da173eb05ee18632" + " " + "flex items-center gap-2 text-sm",
                            children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-da173eb05ee18632" + " " + "font-bold text-gray-300",
                                children: token
                            }, void 0, false, {
                                fileName: "[project]/src/components/LivePriceTicker.tsx",
                                lineNumber: 52,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-da173eb05ee18632" + " " + "text-white font-mono",
                                children: [
                                    "$",
                                    price.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 4
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/LivePriceTicker.tsx",
                                lineNumber: 53,
                                columnNumber: 29
                            }, this),
                                data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-da173eb05ee18632" + " " + `flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`,
                                    children: [
                                        isPositive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                            className: "w-3 h-3 mr-1"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/LivePriceTicker.tsx",
                                            lineNumber: 56,
                                            columnNumber: 51
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__["TrendingDown"], {
                                            className: "w-3 h-3 mr-1"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/LivePriceTicker.tsx",
                                            lineNumber: 56,
                                            columnNumber: 93
                                        }, this),
                                        Math.abs(data.change24h).toFixed(2),
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/LivePriceTicker.tsx",
                                    lineNumber: 55,
                                    columnNumber: 33
                                }, this),
                                !data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-da173eb05ee18632" + " " + "text-gray-600 text-xs",
                                    children: "Loading..."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/LivePriceTicker.tsx",
                                    lineNumber: 60,
                                    columnNumber: 39
                                }, this)
                            ]
                        }, `${token}-${i}`, true, {
                            fileName: "[project]/src/components/LivePriceTicker.tsx",
                            lineNumber: 51,
                            columnNumber: 25
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/LivePriceTicker.tsx",
                    lineNumber: 43,
                    columnNumber: 13
                }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    id: "da173eb05ee18632",
                    children: "@keyframes scroll{0%{transform:translate(0)}to{transform:translate(-50%)}}.animate-scroll.jsx-da173eb05ee18632{animation:30s linear infinite scroll}.animate-scroll.jsx-da173eb05ee18632:hover{animation-play-state:paused}"
                }, void 0, false, void 0, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/LivePriceTicker.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this);
        }
    }),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5eebe39a._.js.map