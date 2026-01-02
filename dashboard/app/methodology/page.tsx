import Link from 'next/link';
import { ArrowLeft, Database, Calculator, Network } from 'lucide-react';

export default function MethodologyPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] font-mono p-8">
            <div className="max-w-3xl mx-auto space-y-12">
                <header>
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        RETURN_TO_DASHBOARD
                    </Link>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-4">
                        METHODOLOGY
                        <span className="text-neon-blue block text-lg font-normal mt-2 font-mono">
                            // DATA_INTEGRITY_PROTOCOLS
                        </span>
                    </h1>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                        Our analysis relies on cross-referencing disparate public record datasets to rebuild the hidden connections between entities.
                        Below is the documentation for our data sources, ingestion pipelines, and risk scoring algorithms.
                    </p>
                </header>

                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <Database className="text-neon-blue" />
                        1. DATA_SOURCES
                    </h2>
                    <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-white mb-2">Primary Dataset: MN DHS License Lookup</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                We utilize a snapshot of the Minnesota Department of Human Services Licensing Lookup tool.
                                Data points include License Number, Status, Type, owner, and Address.
                                <br /><br />
                                <span className="text-zinc-500">SNAPSHOT DATE: Dec 30, 2025</span>
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-2">Secondary Dataset: Federal Indictments</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Entities and individuals named in federal indictments (United States v. [Name]) are manually flagged and cross-referenced against the state license database.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <Calculator className="text-neon-red" />
                        2. RISK_SCORING_ALGORITHM
                    </h2>
                    <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
                        <p className="text-xs text-zinc-400 mb-6">
                            The Risk Score (0-100) is a weighted metric indicating the likelihood of fraudulent activity or regulatory non-compliance.
                        </p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-sm font-bold text-white">Base Score: Active License</span>
                                <span className="text-neon-green font-mono">0 POINTS</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-sm font-bold text-zinc-300">Conditional / Suspended Status</span>
                                <span className="text-amber-500 font-mono">+50 POINTS</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-sm font-bold text-red-400">Revoked / Denied Status</span>
                                <span className="text-neon-red font-mono">+100 POINTS</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-sm font-bold text-purple-400">Network Link to Indicted Entity</span>
                                <span className="text-purple-500 font-mono">+25 POINTS</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-sm font-bold text-white">High-Risk Address Cluster</span>
                                <span className="text-white font-mono">+15 POINTS</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <Network className="text-amber-500" />
                        3. PATTERN_DETECTION
                    </h2>
                    <div className="prose prose-invert prose-sm max-w-none text-zinc-400">
                        <p>
                            We employ graph theory to identify <strong>Address Clusters</strong> and <strong>Ownership Networks</strong>.
                        </p>
                        <ul className="list-disc pl-4 space-y-2 mt-2">
                            <li>
                                <strong>Shared Identity Detection:</strong> Fuzzy matching is used to link owners with slight name variations (e.g., John Smith vs John A. Smith).
                            </li>
                            <li>
                                <strong>The 'Phoenix' Pattern:</strong> Our system specifically flags new entities that open at the exact address of a recently revoked entity, often indicating an attempt to bypass sanctions.
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}
