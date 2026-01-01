"use client";

import { motion } from "framer-motion";
import React from "react";

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-zinc-800 rounded ${className}`} style={style} />
    );
}

interface CardSkeletonProps {
    lines?: number;
}

export function CardSkeleton({ lines = 3 }: CardSkeletonProps) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className="h-3" style={{ width: `${100 - i * 15}%` }} />
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex gap-4 p-4 border-b border-zinc-800 bg-zinc-900">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-zinc-800/50">
                    {[1, 2, 3, 4, 5].map(j => (
                        <Skeleton key={j} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-5 w-48" />
            </div>
            <div className="h-64 flex items-end gap-2 p-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${20 + Math.random() * 80}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="flex-1 bg-zinc-800 rounded-t"
                    />
                ))}
            </div>
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-16" />
                </div>
            ))}
        </div>
    );
}

interface LoadingOverlayProps {
    message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <motion.div
                        className="absolute inset-0 border-2 border-neon-red/30 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-2 border-2 border-t-neon-red border-r-transparent border-b-transparent border-l-transparent rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>
                <p className="text-zinc-400 font-mono text-sm">{message}</p>
            </div>
        </motion.div>
    );
}
