"use client";

import { useState, useMemo } from "react";
import { getDossierList, type InvestigationStatus, type DossierEntry } from "@/lib/dossiers";
import { ShieldCheck, ShieldAlert, AlertTriangle, Search, User, FileText, Archive } from "lucide-react";
import EmployeeDossierModal from "./EmployeeDossierModal";

export default function EmployeeDossier() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDossier, setSelectedDossier] = useState<DossierEntry | null>(null);

    // Use centralized dossier list
    const dossiers = useMemo(() => getDossierList(), []);


    const filteredDossiers = dossiers.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: InvestigationStatus) => {
        switch (status) {
            case "TARGET": return "bg-red-950/50 border-red-500 text-red-200";
            case "BURIED": return "bg-zinc-950 border-zinc-500 text-zinc-400";
            case "POI": return "bg-amber-950/50 border-amber-500 text-amber-200";
            case "PROTECTED": return "bg-blue-950/50 border-blue-500 text-blue-200";
            case "WITNESS": return "bg-purple-950/50 border-purple-500 text-purple-200";
            case "CLEAN": return "bg-emerald-950/20 border-emerald-800/50 text-emerald-100 opacity-80";
        }
    };

    const getStatusIcon = (status: InvestigationStatus) => {
        switch (status) {
            case "TARGET": return <ShieldAlert className="w-5 h-5 text-red-500" />;
            case "BURIED": return <Archive className="w-5 h-5 text-zinc-500" />;
            case "POI": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case "PROTECTED": return <ShieldCheck className="w-5 h-5 text-blue-500" />;
            case "WITNESS": return <FileText className="w-5 h-5 text-purple-500" />;
            case "CLEAN": return <User className="w-5 h-5 text-emerald-500" />;
        }
    };

    return (
        <div className="w-full mt-8 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-zinc-400" />
                        MN STATE EMPLOYEE DOSSIERS
                    </h3>
                    <p className="text-sm text-zinc-400">Investigative status of identified personnel.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search personnel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/50 border border-zinc-700 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-black/20 max-h-[600px] overflow-y-auto">
                {filteredDossiers.map((dossier) => (
                    <div
                        key={dossier.id}
                        id={`dossier-${dossier.name.replace(/\s+/g, '-').replace(/[()]/g, '')}`}
                        onClick={() => setSelectedDossier(dossier)}
                        className={`p-4 rounded-lg border ${getStatusColor(dossier.investigationStatus)} hover:bg-opacity-70 transition-colors scroll-mt-24 target:ring-2 target:ring-white cursor-pointer hover:scale-[1.02]`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(dossier.investigationStatus)}
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/30 bg-opacity-50 border border-white/10">
                                    {dossier.investigationStatus}
                                </span>
                            </div>
                        </div>

                        <h4 className="font-bold text-lg mb-0.5">{dossier.name}</h4>
                        <p className="text-xs font-mono opacity-70 mb-3">{dossier.role}</p>

                        <div className="text-xs leading-relaxed bg-black/20 p-2 rounded">
                            {dossier.notes}
                        </div>
                    </div>
                ))}

                {filteredDossiers.length === 0 && (
                    <div className="col-span-full text-center py-10 text-zinc-500">
                        No personnel found matching search.
                    </div>
                )}
            </div>

            {/* Dossier Detail Modal */}
            <EmployeeDossierModal
                dossier={selectedDossier}
                onClose={() => setSelectedDossier(null)}
            />
        </div>
    );
}
