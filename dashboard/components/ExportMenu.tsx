
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    FileSpreadsheet,
    FileJson,
    Printer,
    ChevronDown,
    Check,
    Loader2,
    Share2,
    Type
} from 'lucide-react';

interface ExportMenuProps {
    data: Record<string, unknown>[];
    filename: string;
    columns?: { key: string; label: string }[];
}

export default function ExportMenu({ data, filename, columns }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const exportToCSV = () => {
        setExporting('csv');

        try {
            // Determine columns from data if not provided
            const cols = columns || (data.length > 0
                ? Object.keys(data[0]).map(key => ({ key, label: key }))
                : []);

            // Build CSV content
            const headers = cols.map(c => `${c.label}`).join(',');
            const rows = data.map(item =>
                cols.map(c => {
                    const value = item[c.key];
                    if (value === null || value === undefined) return '';
                    if (Array.isArray(value)) return `"${value.join('; ')}"`;
                    if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(',')
            ).join('\n');

            const csv = `${headers}\n${rows}`;

            // Download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            setSuccess('csv');
            setTimeout(() => setSuccess(null), 2000);
        } catch (error) {
            console.error('CSV export error:', error);
        } finally {
            setExporting(null);
        }
    };

    const exportToJSON = () => {
        setExporting('json');

        try {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            setSuccess('json');
            setTimeout(() => setSuccess(null), 2000);
        } catch (error) {
            console.error('JSON export error:', error);
        } finally {
            setExporting(null);
        }
    };

    const printView = () => {
        setExporting('print');
        setTimeout(() => {
            window.print();
            setExporting(null);
        }, 100);
    };

    const copySocialText = async () => {
        setExporting('social');
        try {
            const text = `🚨 BREAKING: MN DHS Fraud Investigation

📊 ${data.length} entities tracked
💰 Estimated $9+ BILLION in fraud exposure
📍 14 High-Risk Programs under federal investigation

🔗 Explore the evidence: glasshouse.mn.gov

#ProjectGlassHouse #MinnesotaFraud #DHSInvestigation`;

            await navigator.clipboard.writeText(text);
            setSuccess('social');
            setTimeout(() => setSuccess(null), 2000);
        } catch (error) {
            console.error('Copy error:', error);
        } finally {
            setExporting(null);
        }
    };

    const copyHeadline = async () => {
        setExporting('headline');
        try {
            const highRisk = data.filter((e: { risk_score?: number }) => (e.risk_score || 0) > 80).length;
            const headline = `${data.length} ENTITIES TRACKED | ${highRisk} HIGH RISK | $9B+ EXPOSURE`;

            await navigator.clipboard.writeText(headline);
            setSuccess('headline');
            setTimeout(() => setSuccess(null), 2000);
        } catch (error) {
            console.error('Copy error:', error);
        } finally {
            setExporting(null);
        }
    };

    const dataOptions = [
        { id: 'csv', label: 'Export CSV', icon: FileSpreadsheet, action: exportToCSV, color: 'text-green-500' },
        { id: 'json', label: 'Export JSON', icon: FileJson, action: exportToJSON, color: 'text-blue-500' },
        { id: 'print', label: 'Print View', icon: Printer, action: printView, color: 'text-purple-500' },
    ];

    const mediaOptions = [
        { id: 'social', label: 'Social Media Text', icon: Share2, action: copySocialText, color: 'text-sky-500' },
        { id: 'headline', label: 'Copy Chyron', icon: Type, action: copyHeadline, color: 'text-amber-500' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
            >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-1">
                                <div className="px-2 py-1 text-[10px] text-zinc-600 uppercase tracking-wider">Data</div>
                                {dataOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isExporting = exporting === option.id;
                                    const isSuccess = success === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                option.action();
                                                if (option.id !== 'print') setIsOpen(false);
                                            }}
                                            disabled={exporting !== null}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded transition-colors disabled:opacity-50"
                                        >
                                            {isExporting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : isSuccess ? (
                                                <Check className="w-4 h-4 text-neon-green" />
                                            ) : (
                                                <Icon className={`w-4 h-4 ${option.color}`} />
                                            )}
                                            <span>{isSuccess ? 'Downloaded!' : option.label}</span>
                                        </button>
                                    );
                                })}

                                <div className="my-1 border-t border-zinc-800" />
                                <div className="px-2 py-1 text-[10px] text-zinc-600 uppercase tracking-wider">Media</div>
                                {mediaOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isExporting = exporting === option.id;
                                    const isSuccess = success === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                option.action();
                                            }}
                                            disabled={exporting !== null}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded transition-colors disabled:opacity-50"
                                        >
                                            {isExporting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : isSuccess ? (
                                                <Check className="w-4 h-4 text-neon-green" />
                                            ) : (
                                                <Icon className={`w-4 h-4 ${option.color}`} />
                                            )}
                                            <span>{isSuccess ? 'Copied!' : option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-t border-zinc-800 px-3 py-2">
                                <p className="text-[10px] text-zinc-500">
                                    {data.length} records available
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
