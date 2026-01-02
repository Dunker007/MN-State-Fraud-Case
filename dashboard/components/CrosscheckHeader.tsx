import React from 'react';
import { FileSearch } from 'lucide-react';

export const CrosscheckHeader = () => {
    return (
        <div className="w-full bg-[#050505] border-b border-slate-800 pb-8 pt-4">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-end gap-6">

                {/* BRAND IDENTITY */}
                <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        {/* The Official PROJECT CROSSCHECK Logo */}
                        <img
                            src="/Project_CrossCheck.png"
                            alt="PROJECT CROSSCHECK"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                            PROJECT <span className="text-red-600">CROSS</span>CHECK
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="bg-red-950/40 border border-red-900 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase animate-pulse">
                                Active Investigation
                            </span>
                            <span className="text-slate-500 font-mono text-xs tracking-widest uppercase">
                                MN-DHS CASE FILE #2025-X9
                            </span>
                        </div>
                    </div>
                </div>

                {/* LIVE METRICS */}
                <div className="flex gap-6 text-right">
                    <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Total Diversion</p>
                        <p className="text-2xl font-mono font-bold text-white">$9,000,000,000</p>
                    </div>
                    <div className="border-l border-slate-800 pl-6">
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Targets Identified</p>
                        <p className="text-2xl font-mono font-bold text-red-500 flex items-center justify-end gap-2">
                            19,419 <FileSearch className="w-4 h-4 opacity-50" />
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
