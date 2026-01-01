"use client";

import { motion } from "framer-motion";
import { FileText, Lock, Download, Shield, Eye, Database, Mic } from "lucide-react";
import { type Document } from "@/lib/schemas";

interface DocumentLockerProps {
    documents: Document[];
}

export default function DocumentLocker({ documents }: DocumentLockerProps) {

    const getTypeStyles = (type?: string) => {
        switch (type) {
            case 'OFFICIAL AUDIT': return 'text-blue-300 border-blue-500/30 bg-blue-950/40';
            case 'INVESTIGATIVE REPORT': return 'text-amber-300 border-amber-500/30 bg-amber-950/40';
            case 'INTERNAL MEMO': return 'text-red-300 border-red-500/30 bg-red-950/40';
            case 'FORENSIC MAP': return 'text-purple-300 border-purple-500/30 bg-purple-950/40';
            case 'RAW DATA': return 'text-zinc-300 border-zinc-500/30 bg-zinc-900/50';
            default: return 'text-zinc-400 border-zinc-700/30 bg-zinc-900';
        }
    };

    const getIcon = (type?: string) => {
        if (type === 'RAW DATA') return <Database className="w-5 h-5" />;
        if (type === 'INTERNAL MEMO') return <Lock className="w-5 h-5" />;
        return <FileText className="w-5 h-5" />;
    }

    return (
        <section className="py-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                <Shield className="w-6 h-6 text-neon-green" />
                <h2 className="text-2xl font-bold text-neon-green font-mono">
                    EVIDENCE_LOCKER // THE RECEIPTS
                </h2>
            </div>

            <p className="text-zinc-400 text-sm mb-6 max-w-3xl">
                Confirmed forensic artifacts recovered during the investigation.
                Includes official state audits, leaked internal memos, and raw database exports verifying the fraud timeline.
            </p>

            <div className="grid grid-cols-1 gap-4">
                {documents.map((doc, index) => (
                    <motion.div
                        key={doc.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-black/40 border border-zinc-800 rounded-lg overflow-hidden flex flex-col md:flex-row hover:border-zinc-600 transition-colors group"
                    >
                        {/* Left Status Bar */}
                        <div className={`w-full md:w-2 ${doc.type === 'INTERNAL MEMO' ? 'bg-red-500' :
                                doc.type === 'OFFICIAL AUDIT' ? 'bg-blue-500' :
                                    doc.type === 'INVESTIGATIVE REPORT' ? 'bg-amber-500' : 'bg-zinc-700'
                            }`} />

                        <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {doc.type && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 border rounded uppercase tracking-wider ${getTypeStyles(doc.type)}`}>
                                            {doc.type}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-zinc-500 font-mono">{doc.size}</span>
                                </div>

                                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-neon-blue transition-colors flex items-center gap-2">
                                    {getIcon(doc.type)}
                                    {doc.title}
                                </h3>

                                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                    {doc.description || "No description available."}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mt-2">
                                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white font-bold transition-colors">
                                    <Download className="w-4 h-4" /> DOWNLOAD
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded text-xs text-zinc-300 hover:text-white transition-colors">
                                    <Eye className="w-4 h-4" /> PREVIEW
                                </button>
                                <span className="ml-auto text-xs font-mono text-zinc-600 hidden md:block">
                                    SHA-256 VERIFIED
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-neon-red" />
                    AUDIO EVIDENCE
                </h3>
                <div className="bg-red-950/20 border border-red-900/30 rounded p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-red-200 text-sm">RICO Case Strategy</h4>
                        <p className="text-xs text-red-400/60">Duration: 21:40 • Forensic Interview</p>
                    </div>
                    <div className="w-full md:w-1/2 h-8 bg-zinc-900 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-red-900/50 w-1/3 animate-pulse" />
                        {/* Fake waveform */}
                        <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                            {[...Array(40)].map((_, i) => (
                                <div key={i} className="w-1 bg-red-500/20 h-full" style={{ height: `${Math.random() * 100}%` }} />
                            ))}
                        </div>
                    </div>
                    <button className="px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs rounded border border-red-500/30">PLAY AUDIO</button>
                </div>
            </div>

            <div className="mt-4 p-3 border border-dashed border-zinc-700 bg-black/50 text-zinc-600 text-xs font-mono text-center">
                <Lock className="w-3 h-3 inline mr-1" />
                OFFICIAL RECORD // DO NOT DISTRIBUTE
            </div>
        </section>
    );
}
