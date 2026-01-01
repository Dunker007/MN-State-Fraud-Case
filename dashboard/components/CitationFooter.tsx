import { ExternalLink, CheckCircle } from "lucide-react";

interface CitationFooterProps {
    source: string;
    date: string;
    url?: string;
}

export default function CitationFooter({ source, date, url }: CitationFooterProps) {
    return (
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono border-t border-zinc-800/50 pt-2 mt-4">
            <CheckCircle className="w-3 h-3 text-neon-green/50" />
            <span>SOURCE:</span>
            {url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white underline decoration-zinc-700 underline-offset-2 flex items-center gap-1 transition-colors"
                >
                    {source.toUpperCase()}
                    <ExternalLink className="w-2.5 h-2.5" />
                </a>
            ) : (
                <span className="text-zinc-400">{source.toUpperCase()}</span>
            )}
            <span className="text-zinc-700">|</span>
            <span>VERIFIED: <span className="text-zinc-400">{date}</span></span>
        </div>
    );
}
