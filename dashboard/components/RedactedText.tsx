"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

interface RedactedTextProps {
    text: string;
    revealed?: boolean;
    className?: string;
    revealOnHover?: boolean;
}

export default function RedactedText({
    text,
    revealed = false,
    className = "",
    revealOnHover = true
}: RedactedTextProps) {
    const [isHovered, setIsHovered] = useState(false);
    const showText = revealed || (revealOnHover && isHovered);

    return (
        <motion.span
            className={`relative inline-flex items-center cursor-pointer select-none ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={revealOnHover ? "Hover to declassify" : undefined}
        >
            {/* The Redacted Bar */}
            <motion.span
                className="absolute inset-0 bg-black z-10 flex items-center justify-center"
                initial={{ opacity: 1 }}
                animate={{
                    opacity: showText ? 0 : 1,
                    scaleX: showText ? 0.95 : 1,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <span className="text-[8px] text-zinc-600 font-mono tracking-widest uppercase flex items-center gap-1">
                    <Lock className="w-2 h-2" />
                    REDACTED
                </span>
            </motion.span>

            {/* The Revealed Text */}
            <motion.span
                className="font-mono text-neon-red font-bold relative z-0"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: showText ? 1 : 0,
                    filter: showText ? "blur(0px)" : "blur(4px)",
                }}
                transition={{ duration: 0.4, delay: showText ? 0.1 : 0 }}
            >
                {text}
            </motion.span>

            {/* Declassified indicator */}
            {showText && (
                <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="ml-1"
                >
                    <Unlock className="w-3 h-3 text-green-500" />
                </motion.span>
            )}
        </motion.span>
    );
}

// Wrapper component for batch declassification
interface RedactedSectionProps {
    children: React.ReactNode;
    globalReveal?: boolean;
}

export function RedactedSection({ children, globalReveal = false }: RedactedSectionProps) {
    const [isRevealed, setIsReveased] = useState(globalReveal);

    return (
        <div className="relative">
            <button
                onClick={() => setIsReveased(!isRevealed)}
                className="absolute -top-2 -right-2 z-20 text-[10px] font-mono bg-zinc-900 border border-zinc-700 px-2 py-1 text-zinc-400 hover:text-white hover:border-neon-red transition-colors"
            >
                {isRevealed ? "🔓 CLASSIFIED" : "🔒 DECLASSIFY ALL"}
            </button>
            {children}
        </div>
    );
}
