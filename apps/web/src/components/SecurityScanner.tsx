import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Lock, Unlock, FileCode, Percent } from 'lucide-react';

interface SecurityAnalysis {
    securityScore: number;
    isHoneypot: boolean;
    isRugPull: boolean;
    ownershipRenounced: boolean;
    liquidityLocked: boolean;
    buyTax: number;
    sellTax: number;
    isMintable: boolean;
    isProxy: boolean;
    warnings: string[];
}

export default function SecurityScanner() {
    const [contractAddress, setContractAddress] = useState('');
    const [chain, setChain] = useState('ethereum');
    const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const analyzeContract = async () => {
        if (!contractAddress) {
            setError('Please enter a contract address');
            return;
        }

        setLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/security/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ address: contractAddress, chain }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze contract');
            }

            const data = await response.json();
            setAnalysis(data);
        } catch (err: any) {
            setError(err.message || 'Error analyzing contract');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Safe';
        if (score >= 60) return 'Low Risk';
        if (score >= 40) return 'Medium Risk';
        return 'High Risk';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-7 h-7 text-blue-500" />
                    Smart Contract Security Scanner
                </h2>
                <p className="text-gray-400 mt-1">Analyze contracts for honeypots, rug pulls, and security risks</p>
            </div>

            {/* Scanner Input */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Contract Address</label>
                        <input
                            type="text"
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Blockchain</label>
                        <select
                            value={chain}
                            onChange={(e) => setChain(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        >
                            <option value="ethereum">Ethereum</option>
                            <option value="bsc">Binance Smart Chain</option>
                            <option value="polygon">Polygon</option>
                            <option value="arbitrum">Arbitrum</option>
                            <option value="avalanche">Avalanche</option>
                        </select>
                    </div>

                    <button
                        onClick={analyzeContract}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Analyze Contract
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
            </div>

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-4">
                    {/* Security Score */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 border border-gray-700">
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-2">Security Score</p>
                            <div className={`text-6xl font-bold ${getScoreColor(analysis.securityScore)}`}>
                                {analysis.securityScore}
                                <span className="text-2xl">/100</span>
                            </div>
                            <p className={`text-xl font-semibold mt-2 ${getScoreColor(analysis.securityScore)}`}>
                                {getScoreLabel(analysis.securityScore)}
                            </p>
                        </div>
                    </div>

                    {/* Security Checks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Honeypot Status */}
                        <div className={`rounded-xl p-6 border ${analysis.isHoneypot
                            ? 'bg-red-900/20 border-red-500/30'
                            : 'bg-green-900/20 border-green-500/30'
                            }`}>
                            <div className="flex items-center gap-3">
                                {analysis.isHoneypot ? (
                                    <XCircle className="w-6 h-6 text-red-500" />
                                ) : (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                )}
                                <div>
                                    <p className="font-semibold text-white">Honeypot Status</p>
                                    <p className={`text-sm ${analysis.isHoneypot ? 'text-red-400' : 'text-green-400'}`}>
                                        {analysis.isHoneypot ? 'Confirmed Honeypot!' : 'Not a Honeypot'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Ownership */}
                        <div className={`rounded-xl p-6 border ${analysis.ownershipRenounced
                            ? 'bg-green-900/20 border-green-500/30'
                            : 'bg-yellow-900/20 border-yellow-500/30'
                            }`}>
                            <div className="flex items-center gap-3">
                                {analysis.ownershipRenounced ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                                )}
                                <div>
                                    <p className="font-semibold text-white">Ownership</p>
                                    <p className={`text-sm ${analysis.ownershipRenounced ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {analysis.ownershipRenounced ? 'Renounced' : 'Not Renounced'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Taxes */}
                        <div className="rounded-xl p-6 border bg-gray-800/50 border-gray-700">
                            <div className="flex items-center gap-3">
                                <Percent className="w-6 h-6 text-blue-500" />
                                <div>
                                    <p className="font-semibold text-white">Taxes</p>
                                    <p className="text-sm text-gray-400">
                                        Buy: <span className={analysis.buyTax > 10 ? 'text-red-400' : 'text-green-400'}>{analysis.buyTax.toFixed(1)}%</span>
                                        {' / '}
                                        Sell: <span className={analysis.sellTax > 10 ? 'text-red-400' : 'text-green-400'}>{analysis.sellTax.toFixed(1)}%</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mintable */}
                        <div className={`rounded-xl p-6 border ${analysis.isMintable
                            ? 'bg-yellow-900/20 border-yellow-500/30'
                            : 'bg-green-900/20 border-green-500/30'
                            }`}>
                            <div className="flex items-center gap-3">
                                {analysis.isMintable ? (
                                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                                ) : (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                )}
                                <div>
                                    <p className="font-semibold text-white">Mintable</p>
                                    <p className={`text-sm ${analysis.isMintable ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {analysis.isMintable ? 'Yes (Risk)' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warnings */}
                    {analysis.warnings.length > 0 && (
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Security Warnings
                            </h3>
                            <ul className="space-y-2">
                                {analysis.warnings.map((warning, index) => (
                                    <li key={index} className="text-yellow-200 flex items-start gap-2">
                                        <span className="text-yellow-400 mt-1">•</span>
                                        <span>{warning}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
