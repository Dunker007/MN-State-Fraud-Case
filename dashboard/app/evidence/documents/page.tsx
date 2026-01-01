"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layout, FileText, Lock } from "lucide-react";
import DocumentViewer from "@/components/DocumentViewer";
import { evidenceData } from "@/lib/data";

export default function DocumentsPage() {
    return (
        <div className="flex h-screen bg-black text-white font-mono overflow-hidden">
            <Suspense fallback={<div className="flex items-center justify-center w-full h-full">Loading library...</div>}>
                <DocumentsContent />
            </Suspense>
        </div>
    );
}

function DocumentsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const docId = searchParams.get('id');

    // Use centralized evidence data
    const documents = evidenceData.documents;
    const selectedDoc = documents.find(d => d.id === docId) || null;

    const handleSelect = (id: string) => {
        router.push(`/evidence/documents?id=${id}`);
    };

    return (
        <>
            {/* Sidebar (Library) */}
            <div className="w-80 md:w-96 flex-shrink-0 flex flex-col border-r border-zinc-800 z-10 bg-zinc-950">
                <div className="h-14 border-b border-zinc-800 flex items-center px-4 bg-black flex-shrink-0">
                    <Link href="/?tab=evidence" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs uppercase font-bold">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Document List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-2">Evidence Files ({documents.length})</h3>
                    {documents.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => doc.id && handleSelect(doc.id)}
                            className={`
                                p-3 rounded cursor-pointer border transition-all group
                                ${selectedDoc?.id === doc.id
                                    ? "bg-zinc-900 border-neon-blue/50"
                                    : "bg-transparent border-transparent hover:bg-zinc-900 hover:border-zinc-800"
                                }
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 p-1.5 rounded ${selectedDoc?.id === doc.id ? "bg-neon-blue/10 text-neon-blue" : "bg-zinc-900 text-zinc-500 group-hover:text-zinc-300"}`}>
                                    {doc.type === "INTERNAL MEMO" ? <Lock className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${selectedDoc?.id === doc.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                                        {doc.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {doc.type && (
                                            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-1 rounded border border-zinc-800">
                                                {doc.type}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-zinc-600 font-mono">{doc.size}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content (Viewer) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
                {selectedDoc ? (
                    <DocumentViewer document={selectedDoc} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-sm">Select a document from the evidence locker.</p>
                    </div>
                )}
            </div>

            {/* Mobile Warning (Optional) */}
            <div className="md:hidden absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 text-center">
                <Layout className="w-12 h-12 text-zinc-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Desktop View Required</h3>
                <p className="text-zinc-500 text-sm">
                    The Document War Room requires a larger display for forensic analysis. Please view on a tablet or desktop.
                </p>
                <Link href="/" className="mt-8 px-6 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700">
                    Return to Dashboard
                </Link>
            </div>
        </>
    );
}
