
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Download,
    Printer,
    Highlighter,
    MessageSquare,
    Flag,
    ZoomIn,
    ZoomOut,
    Save
} from 'lucide-react';
import { type Document } from '@/lib/schemas';

interface DocumentViewerProps {
    document: Document | null;
}

export default function DocumentViewer({ document }: DocumentViewerProps) {
    const [activeTool, setActiveTool] = useState<'none' | 'highlight' | 'note' | 'flag'>('none');

    if (!document) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-950">
                <div className="w-16 h-16 border-2 border-zinc-800 rounded-lg mb-4 flex items-center justify-center opacity-50">
                    <Download className="w-8 h-8" />
                </div>
                <p className="font-mono text-sm">Select a document from the library</p>
                <div className="mt-8 flex gap-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 bg-zinc-800 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-900 relative">
            {/* Top Toolbar */}
            <div className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 shadow-xl z-20">
                <div className="flex items-center gap-4">
                    <h2 className="text-white font-bold truncate max-w-[300px]" title={document.title}>
                        {document.title}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors" title="Zoom Out">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-zinc-500 w-12 text-center">100%</span>
                    <button className="p-2 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors" title="Zoom In">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-zinc-800 mx-2" />
                    <button className="p-2 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors" title="Print">
                        <Printer className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                {/* iframe fallback for PDF */}
                <iframe
                    src={document.path}
                    className="w-full h-full border-none"
                    title="PDF Viewer"
                />

                {/* Overlay Guide (Simulated Annotations) */}
                {activeTool !== 'none' && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neon-blue/20 border border-neon-blue text-neon-blue px-4 py-2 rounded-full text-xs font-bold animate-pulse pointer-events-none">
                        {activeTool.toUpperCase()} MODE ACTIVE
                    </div>
                )}
            </div>

            {/* Bottom Floating Toolbar (Annotations) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-full shadow-2xl p-1 flex items-center gap-1 z-30">
                <ToolButton icon={Highlighter} label="Highlight" active={activeTool === 'highlight'} onClick={() => setActiveTool(activeTool === 'highlight' ? 'none' : 'highlight')} />
                <ToolButton icon={MessageSquare} label="Note" active={activeTool === 'note'} onClick={() => setActiveTool(activeTool === 'note' ? 'none' : 'note')} />
                <ToolButton icon={Flag} label="Flag" active={activeTool === 'flag'} onClick={() => setActiveTool(activeTool === 'flag' ? 'none' : 'flag')} />
                <div className="w-px h-4 bg-zinc-700 mx-1" />
                <button className="p-3 text-neon-green hover:bg-zinc-800 rounded-full transition-colors flex items-center gap-2 pr-4">
                    <Save className="w-4 h-4" />
                    <span className="text-xs font-bold">SAVE</span>
                </button>
            </div>
        </div>
    );
}

function ToolButton({ icon: Icon, label, active, onClick }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-full transition-all relative group ${active ? 'bg-neon-blue text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
            title={label}
        >
            <Icon className="w-4 h-4" />
            {active && (
                <motion.div layoutId="activeTool" className="absolute -bottom-1 left-1/2 w-1 h-1 bg-current rounded-full -translate-x-1/2" />
            )}
        </button>
    );
}
