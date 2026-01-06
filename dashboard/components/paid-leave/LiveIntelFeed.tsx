"use client";

import { NewsArticle } from "@/lib/news-scraper";
import { formatDistanceToNow } from "date-fns";

export default function LiveIntelFeed({ articles }: { articles: NewsArticle[] }) {
    if (!articles || articles.length === 0) {
        return (
            <div className="p-4 text-zinc-500 text-sm font-mono text-center border border-zinc-800 rounded bg-black/50">
                SYSTEM OFFLINE. NO INTEL.
            </div>
        );
    }

    // Filter to only approved domains or patterns if needed, but for now show all
    // We want a vertical ticker feel
    return (
        <div className="flex flex-col h-full bg-black/20 border border-white/5 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-white/10 bg-black/60 flex justify-between items-center">
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_purple]"></span>
                    Live Intelligence
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">GDELT V2.0 // DEEP STREAM</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-black">
                <div className="space-y-3">
                    {articles.map((article) => (
                        <a
                            key={article.id}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group relative p-3 bg-black/40 border-l-2 border-zinc-700 hover:border-purple-500 hover:bg-purple-950/10 transition-all duration-300 rounded-r-md"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${article.type === 'social'
                                    ? 'bg-purple-950/50 text-purple-400 border border-purple-800'
                                    : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800'
                                    }`}>
                                    {article.source}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                                    {tryFormatDate(article.pubDate)}
                                </span>
                            </div>

                            <h4 className="text-sm text-zinc-200 font-bold leading-tight mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                                {article.title}
                            </h4>

                            {/* Match Keywords Chips */}
                            <div className="flex flex-wrap gap-1 mt-2">
                                {article.matchedKeywords?.slice(0, 3).map((keyword, i) => (
                                    <span key={i} className="text-[9px] uppercase tracking-wider text-zinc-500 bg-zinc-900/50 px-1 rounded border border-zinc-800">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            <div className="p-2 border-t border-white/5 bg-black/60 text-center">
                <p className="text-[10px] text-zinc-600 font-mono">
                    Secure Connection Established • {articles.length} Active Signals
                </p>
            </div>
        </div>
    );
}

function tryFormatDate(date: Date | string) {
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        return formatDistanceToNow(d, { addSuffix: true });
    } catch (e) {
        return "Unknown";
    }
}
