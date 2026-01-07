'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function GlobalDisclaimer() {
    const [isVisible, setIsVisible] = useState(true);

    // Persist dismissal per session
    useEffect(() => {
        const dismissed = sessionStorage.getItem('disclaimer-dismissed');
        if (dismissed) setIsVisible(false);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('disclaimer-dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-950/90 backdrop-blur-md border-b border-amber-500/30 text-amber-200 px-4 py-2 shadow-2xl animate-in fade-in slide-in-from-top duration-300">
            <div className="max-w-7xl mx-auto flex items-start md:items-center justify-between gap-4 text-xs md:text-sm font-mono">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 md:mt-0 flex-shrink-0 animate-pulse" />
                    <div>
                        <strong className="text-amber-100 font-bold uppercase tracking-wider mr-1">Independent Forensic Tool:</strong>
                        <span>
                            Data sourced from public records and represents <strong>best estimates</strong>.
                            Users should <strong>verify independently</strong> before citing as fact. Not affiliated with MN DHS.
                        </span>
                    </div>
                </div>
                <button 
                    onClick={handleDismiss}
                    className="p-1 hover:bg-amber-900/50 rounded-full transition-colors text-amber-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
