"use client";

import { AlertTriangle } from 'lucide-react';

export default function PaidLeaveDisclaimer() {
    return (
        <div className="bg-gradient-to-r from-amber-950/50 via-amber-900/30 to-amber-950/50 border border-amber-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h4 className="text-amber-400 font-bold text-sm mb-1 font-mono">
                        RESEARCH DASHBOARD DISCLAIMER
                    </h4>
                    <p className="text-amber-200/80 text-xs leading-relaxed">
                        This dashboard presents data aggregated from public sources including the{' '}
                        <span className="text-amber-300">Minnesota Department of Employment and Economic Development (DEED)</span>,{' '}
                        <span className="text-amber-300">MN Revisor of Statutes</span>,{' '}
                        <span className="text-amber-300">Minnesota Courts (MCRO)</span>, and{' '}
                        <span className="text-amber-300">GDELT Project</span>.
                    </p>
                    <p className="text-amber-200/70 text-xs mt-2 leading-relaxed">
                        <strong className="text-amber-300">Projections are illustrative models</strong> based on actuarial analysis
                        of available data and should not be interpreted as official forecasts. Fraud patterns
                        are detected through algorithmic analysis and flagged for investigative review —
                        they do not constitute proof of fraud.
                    </p>
                    <p className="text-amber-200/60 text-[10px] mt-2 font-mono">
                        This is an independent research project by Project CrossCheck / DunkerLux Studios.
                        Not affiliated with or endorsed by the State of Minnesota.
                    </p>
                </div>
            </div>
        </div>
    );
}
