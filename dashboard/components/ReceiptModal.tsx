"use client";

import { useState } from "react";
import { Copy, X, Printer, QrCode, ExternalLink, Download, CheckCircle, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Claim, type GeneratedReceipt, generateReceipt } from "@/lib/claim_verification";

interface ReceiptModalProps {
    claim: Claim;
    onClose: () => void;
}

export default function ReceiptModal({ claim, onClose }: ReceiptModalProps) {
    const [receipt] = useState<GeneratedReceipt>(generateReceipt(claim));

    const handlePrint = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-white print:static"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white text-black w-full max-w-md mx-auto rounded-none shadow-2xl overflow-hidden relative font-mono print:shadow-none print:w-full"
                >
                    {/* Receipt Tear Effect (Top) */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#f3f4f6_5px,#f3f4f6_10px)]" />

                    {/* Header */}
                    <div className="text-center p-6 border-b-2 border-dashed border-zinc-300">
                        <div className="flex justify-center mb-2">
                            <Shield className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-widest">Evidence Receipt</h2>
                        <p className="text-xs text-zinc-500 uppercase">Project Glass House // MN Fraud Inquiry</p>
                        <p className="text-[10px] text-zinc-400 mt-1">{receipt.receipt_id}</p>
                        <p className="text-[10px] text-zinc-400">{new Date(receipt.generated_at).toLocaleString()}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* The Claim */}
                        <div className="bg-zinc-100 p-4 border border-zinc-200">
                            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-1">The Claim</h3>
                            <p className="text-lg font-bold leading-tight">"{claim.statement}"</p>
                            <div className="mt-2 text-xs flex items-center gap-1 text-green-700 font-bold border-t border-zinc-200 pt-2">
                                <CheckCircle className="w-3 h-3" /> VERIFIED BY DATABASE
                            </div>
                        </div>

                        {/* The Evidence */}
                        <div>
                            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2 border-b border-black pb-1">The Evidence</h3>
                            <ul className="text-sm space-y-2">
                                <li className="flex justify-between">
                                    <span className="text-zinc-600">Source:</span>
                                    <span className="font-bold text-right max-w-[200px] truncate">{claim.evidence.primary_source}</span>
                                </li>
                                {claim.evidence.verification_url && (
                                    <li className="flex justify-between items-center">
                                        <span className="text-zinc-600">URL:</span>
                                        <a href={claim.evidence.verification_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                            Source Link <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </li>
                                )}
                                {claim.entity_id && (
                                    <li className="flex justify-between">
                                        <span className="text-zinc-600">Entity ID:</span>
                                        <span className="font-bold">{claim.entity_id}</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Calculation / Details */}
                        {claim.evidence.calculation && (
                            <div>
                                <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2 border-b border-black pb-1">Calculation Logic</h3>
                                <pre className="text-[10px] bg-zinc-50 p-2 border border-zinc-200 overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(claim.evidence.calculation, null, 2)}
                                </pre>
                            </div>
                        )}

                        {/* Verification Steps */}
                        <div>
                            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2 border-b border-black pb-1">How To Verify Yourself</h3>
                            <ol className="list-decimal list-inside text-xs space-y-1 text-zinc-700">
                                {claim.verification_steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ol>
                        </div>

                        {/* Legal Citation */}
                        {claim.legal_citation && (
                            <div className="text-[10px] text-zinc-500 italic text-center mt-4">
                                Legal Ref: {claim.legal_citation}
                            </div>
                        )}
                    </div>

                    {/* Footer / Actions */}
                    <div className="bg-zinc-100 p-4 border-t-2 border-dashed border-zinc-300 print:hidden">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center justify-center gap-2 bg-black text-white text-xs font-bold py-3 uppercase hover:bg-zinc-800 transition-colors"
                            >
                                <Printer className="w-4 h-4" /> Print Receipt
                            </button>
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center gap-2 border border-black text-black text-xs font-bold py-3 uppercase hover:bg-zinc-200 transition-colors"
                            >
                                <X className="w-4 h-4" /> Close
                            </button>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-[10px] text-zinc-400">
                            <span className="flex items-center gap-1"><QrCode className="w-3 h-3" /> SCAN TO VERIFY</span>
                            <span>PROJECT GLASS HOUSE</span>
                        </div>
                    </div>
                    {/* Receipt Tear Effect (Bottom) */}
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-[repeating-linear-gradient(-45deg,transparent,transparent_5px,#f3f4f6_5px,#f3f4f6_10px)]" />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
