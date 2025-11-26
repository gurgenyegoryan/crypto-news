import React, { useState, useEffect } from 'react';
import { Copy, TrendingUp, Play, Pause, Trash2, Plus } from 'lucide-react';

interface CopyTradingConfig {
    id: string;
    followedWallet: string;
    chain: string;
    maxAmountPerTrade: number;
    stopLossPercent?: number;
    takeProfitPercent?: number;
    active: boolean;
}

interface CopyTrade {
    id: string;
    whaleWallet: string;
    whaleTxHash: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
    amountOut?: number;
    status: string;
    profit?: number;
    createdAt: string;
}

export default function CopyTrading() {
    const [configs, setConfigs] = useState<CopyTradingConfig[]>([]);
    const [trades, setTrades] = useState<CopyTrade[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newConfig, setNewConfig] = useState({
        followedWallet: '',
        chain: 'ethereum',
        maxAmountPerTrade: 0.1,
        stopLossPercent: 10,
        takeProfitPercent: 20,
    });

    useEffect(() => {
        fetchConfigs();
        fetchTrades();
    }, []);

    const fetchConfigs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/copy-trading/configs', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            setConfigs(data);
        } catch (error) {
            console.error('Error fetching configs:', error);
        }
    };

    const fetchTrades = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/copy-trading/history?limit=20', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            setTrades(data);
        } catch (error) {
            console.error('Error fetching trades:', error);
        }
    };

    const createConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/copy-trading/configs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newConfig),
            });

            if (response.ok) {
                setShowAddModal(false);
                fetchConfigs();
                setNewConfig({
                    followedWallet: '',
                    chain: 'ethereum',
                    maxAmountPerTrade: 0.1,
                    stopLossPercent: 10,
                    takeProfitPercent: 20,
                });
            }
        } catch (error) {
            console.error('Error creating config:', error);
        }
    };

    const toggleConfig = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/copy-trading/configs/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchConfigs();
        } catch (error) {
            console.error('Error toggling config:', error);
        }
    };

    const deleteConfig = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/copy-trading/configs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchConfigs();
        } catch (error) {
            console.error('Error deleting config:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Copy className="w-7 h-7 text-cyan-500" />
                        Copy Trading (Alpha)
                    </h2>
                    <p className="text-gray-400 mt-1">Automatically copy trades from successful whale wallets</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Config
                </button>
            </div>

            {/* Warning Banner */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="text-yellow-300 font-semibold">Experimental Feature - Use at Your Own Risk</p>
                        <p className="text-yellow-200/70 text-sm mt-1">
                            Copy trading is in alpha. Auto-execution is not yet implemented. This currently tracks whale trades for analysis only.
                            Never invest more than you can afford to lose.
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Configurations */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Your Configurations</h3>
                {configs.length === 0 ? (
                    <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center">
                        <Copy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No copy trading configurations yet</p>
                        <p className="text-sm text-gray-500 mt-2">Add a configuration to start tracking whale wallets</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {configs.map((config) => (
                            <div key={config.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {config.active ? 'Active' : 'Paused'}
                                            </span>
                                            <span className="text-sm text-gray-400">{config.chain.toUpperCase()}</span>
                                        </div>
                                        <p className="text-white font-mono text-sm mb-2">
                                            Following: {config.followedWallet.substring(0, 10)}...{config.followedWallet.substring(config.followedWallet.length - 8)}
                                        </p>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400">Max Per Trade</p>
                                                <p className="text-white font-semibold">{config.maxAmountPerTrade} ETH</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Stop Loss</p>
                                                <p className="text-red-400 font-semibold">{config.stopLossPercent}%</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Take Profit</p>
                                                <p className="text-green-400 font-semibold">{config.takeProfitPercent}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleConfig(config.id)}
                                            className={`p-2 rounded-lg transition-colors ${config.active
                                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                        >
                                            {config.active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => deleteConfig(config.id)}
                                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Trade History */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
                {trades.length === 0 ? (
                    <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 text-center">
                        <p className="text-gray-400">No trades yet</p>
                    </div>
                ) : (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Whale</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Trade</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Profit/Loss</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {trades.map((trade) => (
                                    <tr key={trade.id} className="hover:bg-gray-700/30">
                                        <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                                            {trade.whaleWallet.substring(0, 6)}...{trade.whaleWallet.substring(trade.whaleWallet.length - 4)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {trade.tokenIn} → {trade.tokenOut}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {trade.amountIn} {trade.tokenIn}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${trade.status === 'executed' ? 'bg-green-500/20 text-green-400' :
                                                    trade.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {trade.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {trade.profit !== null && trade.profit !== undefined ? (
                                                <span className={trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Config Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-6">Add Copy Trading Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Whale Wallet Address</label>
                                <input
                                    type="text"
                                    value={newConfig.followedWallet}
                                    onChange={(e) => setNewConfig({ ...newConfig, followedWallet: e.target.value })}
                                    placeholder="0x..."
                                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Blockchain</label>
                                <select
                                    value={newConfig.chain}
                                    onChange={(e) => setNewConfig({ ...newConfig, chain: e.target.value })}
                                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                >
                                    <option value="ethereum">Ethereum</option>
                                    <option value="bsc">Binance Smart Chain</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Max Amount Per Trade (ETH)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newConfig.maxAmountPerTrade}
                                    onChange={(e) => setNewConfig({ ...newConfig, maxAmountPerTrade: parseFloat(e.target.value) })}
                                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Stop Loss (%)</label>
                                    <input
                                        type="number"
                                        value={newConfig.stopLossPercent}
                                        onChange={(e) => setNewConfig({ ...newConfig, stopLossPercent: parseFloat(e.target.value) })}
                                        className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Take Profit (%)</label>
                                    <input
                                        type="number"
                                        value={newConfig.takeProfitPercent}
                                        onChange={(e) => setNewConfig({ ...newConfig, takeProfitPercent: parseFloat(e.target.value) })}
                                        className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createConfig}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
