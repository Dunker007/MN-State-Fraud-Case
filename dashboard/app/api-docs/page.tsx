import { Metadata } from 'next';
import { Code, Server, Database, Zap, Shield, Lock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'API Documentation | Project CrossCheck',
    description: 'Complete API reference for Project CrossCheck endpoints, including provider lookups, analytics, and fraud detection.',
};

export default function APIDocsPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <div className="container mx-auto max-w-5xl px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Code className="w-8 h-8 text-purple-500" />
                        <h1 className="text-4xl font-black uppercase tracking-tight">
                            <span className="text-purple-500">API</span> <span className="text-white">Documentation</span>
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-lg">
                        Complete reference for Project CrossCheck REST APIs. All endpoints return JSON responses.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <a href="#providers" className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-purple-500 transition-colors">
                        <Database className="w-6 h-6 text-purple-500 mb-2" />
                        <h3 className="font-bold">Provider Data</h3>
                        <p className="text-sm text-zinc-500">Lookup provider information</p>
                    </a>
                    <a href="#analytics" className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-purple-500 transition-colors">
                        <Zap className="w-6 h-6 text-purple-500 mb-2" />
                        <h3 className="font-bold">Analytics</h3>
                        <p className="text-sm text-zinc-500">Fraud patterns & simulation</p>
                    </a>
                    <a href="#news" className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-purple-500 transition-colors">
                        <Server className="w-6 h-6 text-purple-500 mb-2" />
                        <h3 className="font-bold">News & Intel</h3>
                        <p className="text-sm text-zinc-500">GDELT aggregation</p>
                    </a>
                </div>

                {/* Authentication */}
                <section className="mb-12 p-6 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Lock className="w-5 h-5 text-amber-500" />
                        <h2 className="text-xl font-bold text-amber-400">Authentication</h2>
                    </div>
                    <p className="text-zinc-300 mb-3">
                        Most endpoints are publicly accessible. Rate limiting applies:
                    </p>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li>• <strong>Public endpoints</strong>: 100 requests/minute</li>
                        <li>• <strong>Authenticated</strong>: Contact for API key</li>
                    </ul>
                </section>

                {/* Endpoints */}
                <div className="space-y-8">
                    {/* Provider APIs */}
                    <section id="providers">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Database className="w-6 h-6 text-purple-500" />
                            Provider Data APIs
                        </h2>

                        {/* GET /api/providers */}
                        <div className="mb-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-green-950/30 text-green-400 border border-green-900/40 rounded font-mono text-sm font-bold">
                                        GET
                                    </span>
                                    <code className="text-lg font-mono text-white">/api/providers</code>
                                </div>
                            </div>
                            <p className="text-zinc-400 mb-4">
                                Retrieve all providers or filter by county/NPI.
                            </p>
                            <div className="bg-black/40 p-4 rounded-lg font-mono text-sm mb-4">
                                <div className="text-purple-400">// Example Request</div>
                                <div className="text-zinc-400">fetch('/api/providers?county=Hennepin');</div>
                            </div>
                            <div className="text-sm text-zinc-500">
                                <strong>Query Parameters:</strong> <code>county</code>, <code>npi</code>, <code>limit</code>
                            </div>
                        </div>

                        {/* GET /api/census */}
                        <div className="mb-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-green-950/30 text-green-400 border border-green-900/40 rounded font-mono text-sm font-bold">
                                        GET
                                    </span>
                                    <code className="text-lg font-mono text-white">/api/census</code>
                                </div>
                            </div>
                            <p className="text-zinc-400 mb-4">
                                Get provider census data by county with metadata.
                            </p>
                            <div className="bg-black/40 p-4 rounded-lg font-mono text-sm">
                                <div className="text-purple-400">// Example Response</div>
                                <pre className="text-zinc-400 mt-2">{`{
  "providers": [...],
  "meta": {
    "total": 1234,
    "county": "Hennepin",
    "last_updated": "2026-01-06"
  }
}`}</pre>
                            </div>
                        </div>
                    </section>

                    {/* Analytics APIs */}
                    <section id="analytics">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Zap className="w-6 h-6 text-purple-500" />
                            Analytics & Fraud Detection
                        </h2>

                        {/* POST /api/analytics/simulation */}
                        <div className="mb-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-blue-950/30 text-blue-400 border border-blue-900/40 rounded font-mono text-sm font-bold">
                                        POST
                                    </span>
                                    <code className="text-lg font-mono text-white">/api/analytics/simulation</code>
                                </div>
                            </div>
                            <p className="text-zinc-400 mb-4">
                                Run Monte Carlo simulations for insolvency forecasting.
                            </p>
                            <div className="bg-black/40 p-4 rounded-lg font-mono text-sm">
                                <div className="text-purple-400">// Example Request Body</div>
                                <pre className="text-zinc-400 mt-2">{`{
  "balance": 500000000,
  "burnRate": 1500000,
  "iterations": 10000
}`}</pre>
                            </div>
                        </div>

                        {/* GET /api/paid-leave/insolvency */}
                        <div className="mb-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-green-950/30 text-green-400 border border-green-900/40 rounded font-mono text-sm font-bold">
                                        GET
                                    </span>
                                    <code className="text-lg font-mono text-white">/api/paid-leave/insolvency</code>
                                </div>
                            </div>
                            <p className="text-zinc-400 mb-4">
                                Get insolvency prediction with burn rate analysis and multi-scenario projections.
                            </p>
                            <div className="text-sm text-zinc-500">
                                <strong>Returns:</strong> Estimated insolvency date, confidence intervals, burn rates, 180-day projections
                            </div>
                        </div>
                    </section>

                    {/* News API */}
                    <section id="news">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Server className="w-6 h-6 text-purple-500" />
                            News & Intelligence
                        </h2>

                        {/* GET /api/news */}
                        <div className="mb-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-green-950/30 text-green-400 border border-green-900/40 rounded font-mono text-sm font-bold">
                                        GET
                                    </span>
                                    <code className="text-lg font-mono text-white">/api/news</code>
                                </div>
                            </div>
                            <p className="text-zinc-400 mb-4">
                                Fetch latest news articles from GDELT with Hunter Protocol rotation.
                            </p>
                            <div className="bg-black/40 p-4 rounded-lg font-mono text-sm">
                                <div className="text-purple-400">// Hunter Protocol Phases (15-min cycles)</div>
                                <div className="text-zinc-400 mt-2">
                                    1. Minnesota Ground Truth<br />
                                    2. Federal Nexus<br />
                                    3. Network Forensics<br />
                                    4. Legislative Response
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-zinc-800 text-center">
                    <p className="text-zinc-500 text-sm mb-4">
                        Need help? <Link href="/" className="text-purple-500 hover:underline">Back to Dashboard</Link>
                    </p>
                    <p className="text-zinc-600 text-xs font-mono">
                        API Documentation • Project CrossCheck • v1.0
                    </p>
                </div>
            </div>
        </main>
    );
}
