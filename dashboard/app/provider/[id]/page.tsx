import { getProviderById } from '@/lib/db/access';
import { notFound } from 'next/navigation';
import { Shield, MapPin, AlertTriangle, Activity, Users, FileText, CheckCircle, XCircle, Ghost } from 'lucide-react';
import { calculateRiskScore } from '@/lib/data';
import Link from 'next/link';
import { Metadata } from 'next';

// Force dynamic rendering since we are checking DB
export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        id: string;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    // Handling the potential Promise for params in Next.js 15+ or current version nuances
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const licenseId = id.replace('MN-', '');
    const provider = getProviderById(licenseId);

    if (!provider) {
        return {
            title: 'Provider Not Found - MN Fraud Dashboard'
        };
    }

    return {
        title: `${provider.name} - MN Fraud Dashboard`,
        description: `Risk analysis and details for provider ${provider.name} (License: ${provider.license_id})`
    };
}

export default async function ProviderPage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const licenseId = id.replace('MN-', '');
    const provider = getProviderById(licenseId);

    if (!provider) {
        notFound();
    }

    const riskScore = calculateRiskScore(provider as any);
    const isHighRisk = riskScore > 50;
    const isGhost = provider.is_ghost_office;

    // Status color helper (duplicated logic from Grid for now, could be utility)
    const getStatusColor = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes('REVOKED') || s.includes('DENIED')) return 'text-neon-red border-neon-red/50 bg-red-950/30';
        if (s.includes('SUSPENDED')) return 'text-orange-400 border-orange-500/50 bg-orange-950/30';
        if (s.includes('CONDITIONAL')) return 'text-yellow-400 border-yellow-500/50 bg-yellow-950/30';
        if (s.includes('ACTIVE')) return 'text-green-400 border-green-500/50 bg-green-950/30';
        return 'text-zinc-400 border-zinc-700 bg-zinc-800/50';
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Breadcrumb / Navigation */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 font-mono">
                    <Link href="/providers" className="hover:text-neon-blue transition-colors">PROVIDERS</Link>
                    <span>/</span>
                    <span className="text-zinc-300">MN-{provider.license_id}</span>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-800 pb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                            {provider.name}
                            {isGhost && (
                                <div title="Ghost Office Suspect">
                                    <Ghost className="w-8 h-8 text-purple-400 animate-pulse" />
                                </div>
                            )}
                        </h1>
                        <div className="flex items-center gap-4 text-sm font-mono">
                            <span className="text-zinc-400 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Owner: <span className="text-white">{provider.owner || 'UNKNOWN'}</span>
                            </span>
                            <span className="text-zinc-600">|</span>
                            <span className="text-zinc-400 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {provider.city}, {provider.county || 'MN'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className={`px-4 py-2 rounded-full border font-mono font-bold text-sm tracking-widest uppercase flex items-center gap-2 ${getStatusColor(provider.status)}`}>
                            {provider.status.includes('ACTIVE') ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {provider.status}
                        </div>
                        <div className="text-xs text-zinc-500 font-mono">
                            Effective: {(provider as any).initial_effective_date || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Risk Dashboard / The Dossier Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Risk Analysis */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Shield className="w-32 h-32" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-neon-blue" />
                                Risk Assessment
                            </h2>

                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-zinc-800" />
                                        <circle
                                            cx="80" cy="80" r="70"
                                            stroke="currentColor"
                                            strokeWidth="10"
                                            fill="transparent"
                                            pathLength="100" // For simple percent calc
                                            strokeDasharray="100"
                                            strokeDashoffset={100 - (Math.min(riskScore, 100))}
                                            className={`${isHighRisk ? 'text-neon-red' : 'text-green-500'} transition-all duration-1000 ease-out`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-4xl font-bold font-mono ${isHighRisk ? 'text-neon-red' : 'text-white'}`}>
                                            {riskScore}
                                        </span>
                                        <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Risk Score</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mt-4">
                                {isGhost && (
                                    <div className="flex items-start gap-3 p-3 bg-purple-950/20 border border-purple-900/50 rounded-lg">
                                        <Ghost className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-purple-300">Ghost Office Detected</h4>
                                            <p className="text-xs text-purple-400/70 mt-1">
                                                Address matches known high-frequency registration cluster.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {provider.status.includes('REVOKED') && (
                                    <div className="flex items-start gap-3 p-3 bg-red-950/20 border border-red-900/50 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-neon-red shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-neon-red">License Revoked</h4>
                                            <p className="text-xs text-red-400/70 mt-1">
                                                Entity is flagged for immediate enforcement action.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {!isGhost && !provider.status.includes('REVOKED') && riskScore < 20 && (
                                    <div className="flex items-start gap-3 p-3 bg-green-950/20 border border-green-900/50 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-green-300">Standard Profile</h4>
                                            <p className="text-xs text-green-400/70 mt-1">
                                                No immediate high-risk anomalies detected in basic profile.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Location Recon</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-zinc-500 mb-1">Registered Address</div>
                                    <div className="font-mono text-sm text-white border-l-2 border-neon-blue pl-3">
                                        {provider.street}<br />
                                        {provider.city}, {provider.zip}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-zinc-500 mb-1">County</div>
                                        <div className="font-mono text-sm text-white">{provider.county || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 mb-1">Service Type</div>
                                        <div className="font-mono text-sm text-white truncate" title={provider.service_type}>{provider.service_type || 'HCBS'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 & 3: Details & Graph Placeholder */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Timeline / History Stub */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-h-[300px]">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-neon-blue" />
                                Licensing Timeline
                            </h2>

                            <div className="relative pl-8 border-l border-zinc-800 space-y-8">
                                {/* Current Status */}
                                <div className="relative">
                                    <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-black border-2 border-neon-blue z-10" />
                                    <div className="mb-1 text-sm font-mono text-neon-blue font-bold">Current</div>
                                    <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
                                        <div className="font-bold text-white">{provider.status}</div>
                                        <div className="text-sm text-zinc-400 mt-1">
                                            Status active as of {provider.status_date || 'Unknown Date'}
                                        </div>
                                    </div>
                                </div>

                                {/* Initial Enrollment */}
                                {(provider as any).initial_effective_date && (
                                    <div className="relative">
                                        <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-black border-2 border-zinc-600 z-10" />
                                        <div className="mb-1 text-sm font-mono text-zinc-500 font-bold">{(provider as any).initial_effective_date}</div>
                                        <div className="text-zinc-400">
                                            Initial Enrollment / Effective Date
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Network Graph Placeholder */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 overflow-hidden h-[300px] relative group">
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <Users className="w-12 h-12 text-zinc-700 mb-4 group-hover:text-neon-blue transition-colors duration-500" />
                                <h3 className="text-lg font-bold text-zinc-500 group-hover:text-white transition-colors">Network Graph</h3>
                                <p className="text-sm text-zinc-600 max-w-sm text-center mt-2">
                                    Entity relationship visualization coming soon in Phase 3.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
