"use client";

import { useState } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { type Claim } from "@/lib/claim_verification";
import ReceiptModal from "./ReceiptModal";

interface ClaimProofButtonProps {
    claim: Claim;
    compact?: boolean;
    className?: string;
}

export default function ClaimProofButton({ claim, compact = false, className = "" }: ClaimProofButtonProps) {
    const [showReceipt, setShowReceipt] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowReceipt(true);
                }}
                className={`flex items-center gap-1.5 transition-colors group ${className} ${compact
                        ? 'text-zinc-500 hover:text-white'
                        : 'text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-full text-xs font-mono uppercase'
                    }`}
                title="View Evidence Receipt"
            >
                {compact ? (
                    <FileText className="w-3.5 h-3.5" />
                ) : (
                    <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span className="font-bold">Show Proof</span>
                    </>
                )}
            </button>

            {showReceipt && (
                <ReceiptModal claim={claim} onClose={() => setShowReceipt(false)} />
            )}
        </>
    );
}
