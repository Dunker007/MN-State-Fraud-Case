'use client';

import { useState, useMemo } from 'react';
import { Newspaper, ChevronRight, AlertCircle, ExternalLink, Calendar, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NewsArticle {
    id: string;
    date: string;
    title: string;
    source: string;
    summary: string;
    url: string;
    scandalTag: string;
    impactScore: number;
}

export const MOCK_NEWS: NewsArticle[] = [
    {
        id: '1',
        date: '2026-01-04',
        title: "DHS Portals Collapse Amidst New Provider Audit Requests",
        source: "St. Paul Sentinel",
        summary: "Multiple transparency advocates report systemic access failures exactly as new legislative inquiries into provider licensing were launched this morning.",
        url: "#",
        scandalTag: "SYSTEMIC_OPACITY",
        impactScore: 92
    },
    {
        id: '1b',
        date: '2026-01-02',
        title: "Leaked Memo: DHS Strategy to 'Throttle' High-Volume Scraping",
        source: "Internal Source",
        summary: "Communication between MNIT and DHS leadership outlines a plan to implement 'aggressive bot mitigation' specifically to target forensic researchers.",
        url: "#",
        scandalTag: "OPPOSITION_INTEL",
        impactScore: 89
    },
    {
        id: '1c',
        date: '2025-11-20',
        title: "The \$4.5B Shadow Budget: Unmapped DHS Transfers",
        source: "MN Taxpayer League",
        summary: "A new report identifies billions in transfers to unlicensed entities that never appeared in the public-facing provider database.",
        url: "#",
        scandalTag: "SHADOW_ACCOUNTING",
        impactScore: 97
    },
    {
        id: '2',
        date: '2024-05-15',
        title: "Radware Implementation at DHS Raises Red Flags",
        source: "Cybersecurity Watch",
        summary: "Digital rights groups question why a public-facing license database requires aggressive AI-driven traffic suppression typically reserved for high-security banking assets.",
        url: "#",
        scandalTag: "TECH_MANEUVER",
        impactScore: 85
    },
    {
        id: '2b',
        date: '2024-08-12',
        title: "DHS 'Technical Glitch' Erases 5 Years of CCAP Audit Trail",
        source: "MN Watchdog",
        summary: "A 'server migration' incident allegedly resulted in the loss of critical oversight logs during the peak of the 2024 fraud investigation.",
        url: "#",
        scandalTag: "DATA_SUPPRESSION",
        impactScore: 94
    },
    {
        id: '2c',
        date: '2023-12-01',
        title: "Provider Portal 'Holiday Maintenance' Lasts 14 Days",
        source: "Health Care Daily",
        summary: "DHS disabled the license lookup tool during the exact window when new transparency laws were set to take effect.",
        url: "#",
        scandalTag: "BUREAUCRATIC_STALL",
        impactScore: 87
    },
    {
        id: '3',
        date: '2022-09-10',
        title: "Mao Lor Ghost Provider Investigation Hits Dead End",
        source: "MN Investigative Journal",
        summary: "Legislative auditors find 'significant' data gaps in the DHS provider masterlist, making the tracking of shell companies nearly impossible for outside observers.",
        url: "#",
        scandalTag: "MAO_LOR",
        impactScore: 98
    },
    {
        id: '3b',
        date: '2022-11-05',
        title: "Searchable License Database Offline for 'Major UI Updates'",
        source: "Tech Tribune",
        summary: "The MN DHS License Lookup tool was taken offline for 3 weeks, coinciding with the subpoena of three major daycare provider networks.",
        url: "#",
        scandalTag: "STRATEGIC_DOWNTIME",
        impactScore: 88
    },
    {
        id: '3c',
        date: '2022-03-24',
        title: "Fraud Task Force Finds \$250M in Duplicate Payments",
        source: "Minneapolis Daily",
        summary: "Newly uncovered ledger entries show millions of dollars flowing to revoked licenses through 'back-office software errors'.",
        url: "#",
        scandalTag: "FINANCIAL_FRAUD",
        impactScore: 96
    },
    {
        id: '3d',
        date: '2021-07-14',
        title: "Systemic Oversight Failure: 1,200 Unlicensed Sites Found",
        source: "Investigation Team 5",
        summary: "A deep dive into historical records reveals hundreds of active providers operating without valid DHS credentials for years.",
        url: "#",
        scandalTag: "OVERSIGHT_FAILURE",
        impactScore: 93
    },
    {
        id: '4',
        date: '2019-06-20',
        title: "Whistleblower: \$9B Overpayment Just the Tip of the Iceberg",
        source: "Minneapolis Daily",
        summary: "Internal documents suggest that DH-managed funds have been diverted through a network of ghost providers for over a decade.",
        url: "#",
        scandalTag: "FINANCIAL_FRAUD",
        impactScore: 95
    },
    {
        id: '4b',
        date: '2019-10-15',
        title: "Wayback Machine Shows DHS Scrubbing Executive Names",
        source: "OpenGov Project",
        summary: "Forensic analysis of web archives reveals that DHS staff listings were purged shortly after several providers were flagged for non-compliance.",
        url: "#",
        scandalTag: "RECORDS_PURGE",
        impactScore: 91
    }
];

export default function ScandalNewsFeed({ activeDate }: { activeDate: string }) {
    // Filter news based on active date from the scrubber
    // For now, we'll show articles from the same year for broader context, 
    // or exact matches for "hot" dates.
    const relevantArticles = useMemo(() => {
        if (!activeDate) return [];
        const activeYear = activeDate.split('-')[0];

        return MOCK_NEWS.filter(article => {
            const articleYear = article.date.split('-')[0];
            // If it's an exact date match, it's high priority
            // Otherwise, show articles from the same year
            return articleYear === activeYear;
        }).sort((a, b) => b.impactScore - a.impactScore);
    }, [activeDate]);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
            <div className="p-4 bg-blue-950/20 border-b border-blue-900/50 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-500" />
                    <span className="text-[18px] font-black uppercase tracking-widest text-white italic">Scandal Intelligence</span>
                </div>
                <div className="px-3 py-1 bg-blue-900/30 border border-blue-500/50 rounded text-[10px] font-mono font-bold text-blue-400">
                    {relevantArticles.length} REPORTS_LOGGED
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/20">
                {relevantArticles.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {relevantArticles.map((article) => (
                                <motion.div
                                    key={article.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg group hover:border-amber-500/50 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-4 h-4 text-amber-500" />
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                                            {article.source}
                                        </div>
                                        <div className="text-[10px] font-mono text-amber-500/60 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {article.date}
                                        </div>
                                    </div>

                                    <h3 className="text-[16px] font-bold text-white leading-tight mb-2 group-hover:text-amber-400 transition-colors">
                                        {article.title}
                                    </h3>

                                    <p className="text-[13px] text-zinc-400 leading-relaxed line-clamp-3 mb-3 font-medium">
                                        {article.summary}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3 text-red-500" />
                                            <span className="text-[10px] font-black text-red-500/80 uppercase tracking-widest">
                                                {article.scandalTag}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-mono font-black text-zinc-600">
                                            IMPACT_SCORE: {article.impactScore}%
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mb-4 opacity-30">
                            <Search className="w-6 h-6 text-zinc-500" />
                        </div>
                        <p className="text-zinc-600 font-mono italic text-xs leading-relaxed uppercase tracking-widest">
                            No direct scandal correlation discovered for era {activeDate?.split('-')[0] || 'Unknown'}
                        </p>
                    </div>
                )}
            </div>

            <div className="p-3 bg-zinc-950 border-t border-zinc-800">
                <div className="text-[9px] font-mono text-zinc-600 uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Live Scanning for Conflict Overlap
                </div>
            </div>
        </div>
    );
}
