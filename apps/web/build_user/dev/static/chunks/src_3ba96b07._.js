(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
    "[project]/src/hooks/useRealtime.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
        "use strict";

        __turbopack_context__.s([
            "useRealtime",
            () => useRealtime
        ]);
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
        var _s = __turbopack_context__.k.signature();
        ;
        ;
        const SOCKET_URL = ("TURBOPACK compile-time value", "http://api:3000") || 'http://api:3000';
        const useRealtime = () => {
            _s();
            const socketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
            const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
                "useRealtime.useEffect": () => {
                    const token = localStorage.getItem('auth_token');
                    // Don't attempt to connect if there is no token
                    if (!token) {
                        return;
                    }
                    // Connect to the 'events' namespace
                    socketRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])(`${SOCKET_URL}/events`, {
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
                    socketRef.current.on('connect', {
                        "useRealtime.useEffect": () => {
                            console.log('Connected to WebSocket');
                            setIsConnected(true);
                        }
                    }["useRealtime.useEffect"]);
                    socketRef.current.on('disconnect', {
                        "useRealtime.useEffect": () => {
                            console.log('Disconnected from WebSocket');
                            setIsConnected(false);
                        }
                    }["useRealtime.useEffect"]);
                    socketRef.current.on('connect_error', {
                        "useRealtime.useEffect": (err) => {
                            // Suppress 403 errors to keep console clean, as they are expected when auth fails
                            if (err.message.includes('403') || err.data?.code === 403) {
                                console.warn('WebSocket auth failed (403). This is expected if session expired.');
                            } else {
                                console.error('WebSocket connection error:', err.message);
                            }
                            setIsConnected(false);
                        }
                    }["useRealtime.useEffect"]);
                    return ({
                        "useRealtime.useEffect": () => {
                            if (socketRef.current) {
                                socketRef.current.disconnect();
                            }
                        }
                    })["useRealtime.useEffect"];
                }
            }["useRealtime.useEffect"], []);
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
        _s(useRealtime, "CYN7YzET2lyTayvLD2y4n9TqHs0=");
        if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
            __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
        }
    }),
    "[project]/src/components/LivePriceTicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
        "use strict";

        __turbopack_context__.s([
            "default",
            () => LivePriceTicker
        ]);
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useRealtime.ts [app-client] (ecmascript)");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-down.js [app-client] (ecmascript) <export default as TrendingDown>");
        ;
        var _s = __turbopack_context__.k.signature();
        "use client";
        ;
        ;
        ;
        ;
        function LivePriceTicker() {
            _s();
            const { socket, isConnected, subscribeToTicker } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRealtime"])();
            const [prices, setPrices] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Map());
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
                "LivePriceTicker.useEffect": () => {
                    if (isConnected && socket) {
                        // Subscribe to updates
                        subscribeToTicker(tokens);
                        // Listen for updates
                        socket.on('tickerUpdate', {
                            "LivePriceTicker.useEffect": (data) => {
                                setPrices({
                                    "LivePriceTicker.useEffect": (prev) => {
                                        const newMap = new Map(prev);
                                        newMap.set(data.token, data);
                                        return newMap;
                                    }
                                }["LivePriceTicker.useEffect"]);
                            }
                        }["LivePriceTicker.useEffect"]);
                        return ({
                            "LivePriceTicker.useEffect": () => {
                                socket.off('tickerUpdate');
                            }
                        })["LivePriceTicker.useEffect"];
                    }
                }
            }["LivePriceTicker.useEffect"], [
                isConnected,
                socket
            ]);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-da173eb05ee18632" + " " + "w-full bg-black/80 border-b border-white/10 overflow-hidden py-2",
                children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-da173eb05ee18632" + " " + "flex items-center gap-8 animate-scroll whitespace-nowrap",
                    children: [
                        ...tokens,
                        ...tokens
                    ].map((token, i) => {
                        const data = prices.get(token);
                        const price = data?.price || 0;
                        const isPositive = (data?.change24h || 0) >= 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-da173eb05ee18632" + " " + "flex items-center gap-2 text-sm",
                            children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-da173eb05ee18632" + " " + "font-bold text-gray-300",
                                children: token
                            }, void 0, false, {
                                fileName: "[project]/src/components/LivePriceTicker.tsx",
                                lineNumber: 52,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-da173eb05ee18632" + " " + `flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`,
                                    children: [
                                        isPositive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                            className: "w-3 h-3 mr-1"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/LivePriceTicker.tsx",
                                            lineNumber: 56,
                                            columnNumber: 51
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__["TrendingDown"], {
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
                                !data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
        _s(LivePriceTicker, "nP7rDgJlhThjLEt1N6vLHJdwKyM=", false, function () {
            return [
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRealtime"]
            ];
        });
        _c = LivePriceTicker;
        var _c;
        __turbopack_context__.k.register(_c, "LivePriceTicker");
        if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
            __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
        }
    }),
]);

//# sourceMappingURL=src_3ba96b07._.js.map