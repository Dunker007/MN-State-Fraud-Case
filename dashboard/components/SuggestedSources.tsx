"use client";

import { motion } from "framer-motion";
import { Lightbulb, ExternalLink, Rss, Podcast, Radio } from "lucide-react";

interface SuggestedSource {
    id: string;
    name: string;
    type: "news" | "podcast" | "newsletter" | "blog";
    url: string;
    description: string;
    category: "msm" | "social";
}

export default function SuggestedSources() {
    const sources: SuggestedSource[] = [
        // Mainstream Media Suggestions
        {
            id: "kstp",
            name: "KSTP News",
            type: "news",
            url: "https://kstp.com",
            description: "Local ABC affiliate covering MN politics",
            category: "msm"
        },
        {
            id: "kare11",
            name: "KARE 11",
            type: "news",
            url: "https://kare11.com",
            description: "NBC affiliate with investigative team",
            category: "msm"
        },
        {
            id: "wcco",
            name: "WCCO CBS Minnesota",
            type: "news",
            url: "https://wcco.com",
            description: "CBS local news and investigations",
            category: "msm"
        },
        {
            id: "fox9",
            name: "FOX 9 Minneapolis",
            type: "news",
            url: "https://fox9.com",
            description: "Local FOX investigative reporting",
            category: "msm"
        },

        // Social Media / Alternative Suggestions
        {
            id: "mn-reddit",
            name: "r/MinnesotaPolitics",
            type: "blog",
            url: "https://reddit.com/r/minnesota",
            description: "Community discussions on state politics",
            category: "social"
        },
        {
            id: "powerline",
            name: "PowerLine Blog",
            type: "blog",
            url: "https://powerlineblog.com",
            description: "Conservative commentary on MN politics",
            category: "social"
        },
        {
            id: "mn-podcast",
            name: "MPR Politics Podcast",
            type: "podcast",
            url: "https://mprnews.org/podcasts",
            description: "Weekly political analysis and news",
            category: "social"
        },
        {
            id: "updraft",
            name: "MinnPost",
            type: "newsletter",
            url: "https://minnpost.com",
            description: "Non-profit investigative journalism",
            category: "social"
        }
    ];

    const msmSources = sources.filter(s => s.category === "msm");
    const socialSources = sources.filter(s => s.category === "social");

    const typeIcons = {
        news: Rss,
        podcast: Podcast,
        newsletter: Radio,
        blog: ExternalLink
    };

    const SourceCard = ({ source }: { source: SuggestedSource }) => {
        const Icon = typeIcons[source.type];

        return (
            <motion.a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="block p-3 bg-zinc-900/50 border border-zinc-800 rounded hover:border-zinc-600 transition-all"
            >
                <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm text-white font-bold truncate">{source.name}</h4>
                            <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded uppercase">
                                {source.type}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2">{source.description}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                </div>
            </motion.a>
        );
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <div>
                    <h2 className="text-lg font-bold text-white font-mono">SUGGESTED_SOURCES</h2>
                    <p className="text-xs text-zinc-500 font-mono">
                        Additional sources to monitor
                    </p>
                </div>
            </div>

            {/* Split: MSM (Left) and Social/Alternative (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Mainstream Media Sources */}
                <div>
                    <h3 className="text-xs text-blue-400 font-mono uppercase mb-3">
                        Mainstream Media
                    </h3>
                    <div className="space-y-2">
                        {msmSources.map(source => (
                            <SourceCard key={source.id} source={source} />
                        ))}
                    </div>
                </div>

                {/* Social/Alternative Sources */}
                <div>
                    <h3 className="text-xs text-purple-400 font-mono uppercase mb-3">
                        Social & Alternative
                    </h3>
                    <div className="space-y-2">
                        {socialSources.map(source => (
                            <SourceCard key={source.id} source={source} />
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
