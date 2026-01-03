"use client";

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorFallbackProps {
    error?: Error;
    title?: string;
    message?: string;
    showRetry?: boolean;
    onRetry?: () => void;
}

export default function ErrorFallback({
    error,
    title = "Something went wrong",
    message = "An error occurred while loading this content.",
    showRetry = true,
    onRetry
}: ErrorFallbackProps) {
    return (
        <div className="min-h-[300px] flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>

                {/* Message */}
                <p className="text-zinc-400 text-sm mb-6">{message}</p>

                {/* Error Details (dev only) */}
                {error && process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-left">
                        <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Error Details</p>
                        <p className="text-xs text-red-400 font-mono break-all">{error.message}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    {showRetry && onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                    )}
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                </div>

                {/* Branding */}
                <p className="mt-8 text-[10px] text-zinc-700 font-mono">
                    PROJECT CROSSCHECK • ERROR_STATE
                </p>
            </div>
        </div>
    );
}
