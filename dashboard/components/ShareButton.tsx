"use client";

import { useState, useCallback } from 'react';
import { Share2, Link, Twitter, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
    title?: string;
    text?: string;
    url?: string;
    variant?: 'default' | 'compact' | 'full';
    className?: string;
}

export default function ShareButton({
    title = 'Project CrossCheck',
    text = 'Exposing $9B+ in Minnesota state fraud',
    url,
    variant = 'default',
    className = ''
}: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [shareUrl]);

    const handleTwitterShare = useCallback(() => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    }, [text, shareUrl]);

    const handleNativeShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl
                });
            } catch {
                // User cancelled or error
                console.log('Share cancelled');
            }
        } else {
            setIsOpen(true);
        }
    }, [title, text, shareUrl]);

    if (variant === 'compact') {
        return (
            <button
                onClick={handleNativeShare}
                className={`p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors ${className}`}
                title="Share"
            >
                <Share2 className="w-4 h-4" />
            </button>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-bold transition-colors"
            >
                <Share2 className="w-4 h-4" />
                Share
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-3 border-b border-zinc-800">
                                <p className="text-xs text-zinc-500 font-mono uppercase">Share this page</p>
                            </div>

                            <div className="p-2 space-y-1">
                                {/* Copy Link */}
                                <button
                                    onClick={handleCopyLink}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-zinc-400" />
                                    )}
                                    <span className={`text-sm ${copied ? 'text-green-400' : 'text-white'}`}>
                                        {copied ? 'Copied!' : 'Copy link'}
                                    </span>
                                </button>

                                {/* Twitter/X */}
                                <button
                                    onClick={handleTwitterShare}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                                >
                                    <Twitter className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-white">Share on X</span>
                                </button>

                                {/* Native Share (if available) */}
                                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                    <button
                                        onClick={handleNativeShare}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                                    >
                                        <Link className="w-4 h-4 text-zinc-400" />
                                        <span className="text-sm text-white">More options...</span>
                                    </button>
                                )}
                            </div>

                            <div className="p-3 border-t border-zinc-800 bg-zinc-950/50">
                                <p className="text-[10px] text-zinc-600 font-mono">
                                    PROJECT CROSSCHECK • {new URL(shareUrl).pathname}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
