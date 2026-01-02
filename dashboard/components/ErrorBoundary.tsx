"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-6 bg-red-950/30 border border-red-900/50 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-neon-red" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                        <p className="text-zinc-400 text-sm mb-6">
                            An error occurred while loading this section. This has been logged for investigation.
                        </p>

                        {this.state.error && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded p-3 mb-6 text-left">
                                <p className="text-[10px] text-zinc-500 uppercase mb-1">Error Details</p>
                                <p className="text-xs text-red-400 font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Try Again</span>
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                <span>Go Home</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for use with hooks
interface ErrorFallbackProps {
    error: Error;
    resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
    return (
        <div className="min-h-[200px] flex items-center justify-center p-6 bg-red-950/20 border border-red-900/30 rounded-lg">
            <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-neon-red mx-auto mb-3" />
                <p className="text-zinc-300 text-sm mb-3">Failed to load this component</p>
                <p className="text-xs text-red-400 font-mono mb-4">{error.message}</p>
                <button
                    onClick={resetError}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );
}
