"use client";

import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Check } from 'lucide-react';

interface ExportButtonProps {
    className?: string;
    compact?: boolean;
}

export default function ExportButton({ className = '', compact = false }: ExportButtonProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    const handleExport = async (format: 'csv' | 'json') => {
        setLoading(true);
        setShowMenu(false);

        try {
            const response = await fetch(`/api/export/${format}`);

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
            const filename = filenameMatch?.[1] || `export.${format}`;

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setSuccess(format.toUpperCase());
            setTimeout(() => setSuccess(null), 2000);

        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        return (
            <div className={`relative ${className}`}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Export data"
                >
                    {success ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : loading ? (
                        <Download className="w-4 h-4 text-zinc-500 animate-pulse" />
                    ) : (
                        <Download className="w-4 h-4 text-zinc-500" />
                    )}
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[120px]">
                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 flex items-center gap-2 rounded-t-lg"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-green-500" />
                            CSV
                        </button>
                        <button
                            onClick={() => handleExport('json')}
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 flex items-center gap-2 rounded-b-lg"
                        >
                            <FileJson className="w-4 h-4 text-blue-500" />
                            JSON
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                onClick={() => handleExport('csv')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
                <FileSpreadsheet className="w-4 h-4 text-green-500" />
                {loading ? 'Exporting...' : 'CSV'}
            </button>
            <button
                onClick={() => handleExport('json')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
                <FileJson className="w-4 h-4 text-blue-500" />
                {loading ? 'Exporting...' : 'JSON'}
            </button>
            {success && (
                <span className="text-green-500 text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {success} downloaded
                </span>
            )}
        </div>
    );
}
