"use client";

import GlitchText from '@/components/sandbox/GlitchText';

export default function IntelLog({ items }: { items: any[] }) {
    if (!items) return null;

    return (
        <div className="h-full bg-black border border-green-900/30 font-mono text-xs overflow-hidden flex flex-col">
            <div className="bg-green-900/10 p-2 border-b border-green-900/30 flex justify-between items-center">
                <span className="text-green-500 font-bold">RAW_INTEL_WIRE</span>
                <span className="text-[10px] text-green-800 animate-pulse">● LIVE</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-green-400 scrollbar-hide">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-4 border-l-2 border-green-900/30 pl-2 hover:bg-green-900/10 hover:border-green-500 transition-colors cursor-crosshair">
                        <span className="text-green-800 whitespace-nowrap opacity-50">
                            {new Date(item.publishedDate || item.date).toLocaleTimeString()}
                        </span>
                        <div className="break-words">
                            <span className="text-green-600 mr-2">[SIGINT]</span>
                            <span className="opacity-90">{item.title || item.notes}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
