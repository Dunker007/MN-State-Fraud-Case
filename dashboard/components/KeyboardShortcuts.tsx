"use client";

import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsProps {
    onRefresh?: () => void;
    onExport?: () => void;
    onFullscreen?: () => void;
}

const SHORTCUTS = [
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'r', description: 'Refresh all data' },
    { key: 'e', description: 'Export data (CSV)' },
    { key: 'f', description: 'Toggle fullscreen' },
    { key: 'j', description: 'Scroll down' },
    { key: 'k', description: 'Scroll up' },
    { key: 'g g', description: 'Go to top' },
    { key: 'G', description: 'Go to bottom' },
    { key: 'Esc', description: 'Close modal/menu' }
];

export default function KeyboardShortcuts({ onRefresh, onExport, onFullscreen }: KeyboardShortcutsProps) {
    const [showModal, setShowModal] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore if typing in input/textarea
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        // ? - Show shortcuts
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setShowModal(prev => !prev);
            return;
        }

        // Esc - Close modal
        if (e.key === 'Escape') {
            setShowModal(false);
            return;
        }

        // r - Refresh
        if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onRefresh?.();
            return;
        }

        // e - Export
        if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onExport?.();
            return;
        }

        // f - Fullscreen
        if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onFullscreen?.();
            return;
        }

        // j - Scroll down
        if (e.key === 'j') {
            window.scrollBy({ top: 100, behavior: 'smooth' });
            return;
        }

        // k - Scroll up
        if (e.key === 'k') {
            window.scrollBy({ top: -100, behavior: 'smooth' });
            return;
        }

        // G - Go to bottom
        if (e.key === 'G' && e.shiftKey) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            return;
        }
    }, [onRefresh, onExport, onFullscreen]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
                    <button
                        onClick={() => setShowModal(false)}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    {SHORTCUTS.map(({ key, description }) => (
                        <div key={key} className="flex items-center justify-between py-2">
                            <span className="text-zinc-300">{description}</span>
                            <kbd className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-sm font-mono">
                                {key}
                            </kbd>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 text-center">
                        Press <kbd className="px-1 bg-zinc-800 rounded">?</kbd> anytime to show this menu
                    </p>
                </div>
            </div>
        </div>
    );
}

// Hook for using keyboard shortcuts in components
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const handler = shortcuts[e.key];
            if (handler) {
                e.preventDefault();
                handler();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}
