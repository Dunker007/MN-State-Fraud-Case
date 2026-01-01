import { evidenceData } from "@/lib/data";
import { type Entity } from "@/lib/schemas";
import { CheckCircle, AlertTriangle, Scale, MapPin } from "lucide-react";

export default async function BriefingPage({ searchParams }: { searchParams: Promise<{ ids: string }> }) {
    const params = await searchParams;
    const ids = (params.ids || "").split(",").filter(Boolean);

    // Filter Data
    const entities = evidenceData.entities.filter(e => ids.includes(e.id));

    // Calculate Stats
    const totalExposure = entities.reduce((sum, e) => sum + e.amount_billed, 0);
    const avgRisk = entities.reduce((sum, e) => sum + e.risk_score, 0) / (entities.length || 1);
    const uniqueOwners = new Set(entities.map(e => e.owner).filter(o => o && o !== "UNKNOWN"));
    const flaggedCount = entities.filter(e => e.risk_score > 0).length;

    if (entities.length === 0) {
        return <div className="p-8 font-mono">NO_DATA_FOUND. INVALID_IDS.</div>;
    }

    return (
        <div className="min-h-screen bg-white text-black font-serif p-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
            {/* Print Header */}
            <div className="border-b-4 border-black mb-8 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">INVESTIGATIVE BRIEFING</h1>
                    <div className="text-sm font-mono text-gray-600">
                        MN FRAUD TASKFORCE // GENERATED REPORT
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-mono text-gray-500 mb-1">DATE GENERATED</div>
                    <div className="font-bold">{new Date().toLocaleDateString()}</div>
                </div>
            </div>

            {/* Executive Summary */}
            <section className="mb-12 bg-gray-50 p-6 border border-gray-200 print:bg-transparent print:border-black print:p-0 print:mb-8">
                <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4 uppercase tracking-wider">Executive Summary</h2>
                <p className="mb-4 leading-relaxed">
                    This document contains a forensic analysis of <strong>{entities.length} entity target(s)</strong> identified within the Minnesota Department of Human Services network.
                    The aggregate est. exposure for the selected targets is <strong>${totalExposure.toLocaleString()}</strong>.
                </p>

                <div className="grid grid-cols-2 gap-8 mt-6">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Key Indicators</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between border-b border-gray-200 pb-1">
                                <span>Risk Level Assessment:</span>
                                <span className={`font-bold ${avgRisk > 80 ? 'text-red-700' : 'text-black'}`}>
                                    {avgRisk > 80 ? 'CRITICAL' : avgRisk > 40 ? 'ELEVATED' : 'MODERATE'} ({Math.round(avgRisk)}/100)
                                </span>
                            </li>
                            <li className="flex justify-between border-b border-gray-200 pb-1">
                                <span>Flagged Entities:</span>
                                <span>{flaggedCount} of {entities.length}</span>
                            </li>
                            <li className="flex justify-between border-b border-gray-200 pb-1">
                                <span>Identified Owners:</span>
                                <span>{uniqueOwners.size} Distinct Individuals</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Primary Targets</h3>
                        <ul className="text-sm space-y-1">
                            {entities.slice(0, 5).map(e => (
                                <li key={e.id} className="truncate">• {e.name}</li>
                            ))}
                            {entities.length > 5 && <li className="text-gray-500 italic">+ {entities.length - 5} more</li>}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Entity Profiles */}
            <div className="space-y-12 print:space-y-0">
                {entities.map((entity, index) => (
                    <section key={entity.id} className="break-inside-avoid print:break-before-page mb-8 border border-gray-200 p-6 print:border-none print:p-0">
                        {/* Profile Header */}
                        <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">{entity.name}</h2>
                                <div className="text-sm font-mono text-gray-600 flex gap-4">
                                    <span>ID: {entity.id}</span>
                                    <span>TYPE: {entity.type}</span>
                                    <span>STATUS: {entity.status}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold font-mono">{entity.risk_score}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Risk Score</div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
                            <div>
                                <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-xs">Registration Data</h3>
                                <div className="grid grid-cols-[100px_1fr] gap-y-2">
                                    <span className="text-gray-500">Owner:</span>
                                    <span className="font-medium">{entity.owner || "N/A"}</span>

                                    <span className="text-gray-500">Address:</span>
                                    <span className="font-medium flex items-start gap-1">
                                        <MapPin className="w-3 h-3 mt-1 text-gray-400" />
                                        {entity.address}, {entity.city}
                                    </span>

                                    <span className="text-gray-500">License:</span>
                                    <span>{entity.id}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-xs">Risk Factors</h3>
                                {entity.risk_score > 0 ? (
                                    <ul className="space-y-1">
                                        {(entity.red_flag_reason || []).map((flag, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <AlertTriangle className="w-3 h-3 mt-0.5 text-red-600" />
                                                <span>{flag}</span>
                                            </li>
                                        ))}
                                        {entity.federal_status === "INDICTED" && (
                                            <li className="flex items-start gap-2 text-red-700 font-bold">
                                                <Scale className="w-3 h-3 mt-0.5" />
                                                <span>FEDERAL INDICTMENT CONFIRMED</span>
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>No Significant Flags Detected</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financials Stub */}
                        <div className="bg-gray-50 p-4 border border-gray-200 print:bg-transparent print:border-black print:border-dashed">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold uppercase text-gray-600">Total Billed Amt (Est):</span>
                                <span className="text-xl font-mono font-bold">${entity.amount_billed.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-4 text-[10px] text-gray-400 font-mono text-center">
                            SOURCE: {entity.source_url || "MN DHS"} | VERIFIED: {entity.last_verified || "Pending"}
                        </div>
                    </section>
                ))}
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-300 text-center text-xs text-gray-500 font-mono print:fixed print:bottom-0 print:left-0 print:w-full">
                <p>CONFIDENTIAL // FOR INVESTIGATIVE USE ONLY</p>
                <p>Generated by MN Fraud Taskforce Dashboard</p>
            </footer>
        </div>
    );
}
