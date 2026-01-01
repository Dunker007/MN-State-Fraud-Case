"use client";

import { motion } from "framer-motion";
import {
    User,
    ExternalLink,
    Star,
    Youtube,
    Newspaper,
    Twitter
} from "lucide-react";
import { TRACKED_REPORTERS, type TrackedReporter } from "@/lib/news-sources";

const platformIcons = {
    news: Newspaper,
    youtube: Youtube,
    twitter: Twitter,
};

const platformColors = {
    news: "text-blue-500",
    youtube: "text-red-500",
    twitter: "text-sky-500",
};

export default function ReporterTracker() {
    // Split reporters by platform type
    const msmReporters = TRACKED_REPORTERS.filter(r => r.platform === "news");
    const socialReporters = TRACKED_REPORTERS.filter(r => r.platform !== "news");

    const ReporterCard = ({ reporter, index }: { reporter: TrackedReporter; index: number }) => {
        const PlatformIcon = platformIcons[reporter.platform];
        const platformColor = platformColors[reporter.platform];

        return (
            <motion.a
                href={reporter.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`block p-4 rounded border transition-all hover:scale-[1.02] ${reporter.isPrimary
                    ? 'bg-gradient-to-br from-amber-950/30 to-zinc-900 border-amber-900/50 hover:border-amber-700'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'
                    }`}
            >
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${reporter.isPrimary ? 'bg-amber-950/50' : 'bg-zinc-800'}`}>
                        <PlatformIcon className={`w-5 h-5 ${platformColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold truncate">{reporter.name}</h3>
                            {reporter.isPrimary && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-zinc-500 font-mono truncate">{reporter.outlet}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-600 flex-shrink-0" />
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
                <User className="w-5 h-5 text-purple-500" />
                <div>
                    <h2 className="text-lg font-bold text-white font-mono">REPORTER_TRACKER</h2>
                    <p className="text-xs text-zinc-500 font-mono">
                        Key journalists covering the investigation
                    </p>
                </div>
            </div>

            {/* Split: MSM (Left) and Social Media (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Mainstream Media - Left */}
                <div>
                    <h3 className="text-xs text-blue-400 font-mono uppercase mb-3 flex items-center gap-2">
                        <Newspaper className="w-4 h-4" />
                        Mainstream Media
                    </h3>
                    <div className="space-y-3">
                        {msmReporters.map((reporter, index) => (
                            <ReporterCard key={reporter.id} reporter={reporter} index={index} />
                        ))}
                    </div>
                </div>

                {/* Social Media - Right */}
                <div>
                    <h3 className="text-xs text-purple-400 font-mono uppercase mb-3 flex items-center gap-2">
                        <Youtube className="w-4 h-4" />
                        Social Media
                    </h3>
                    <div className="space-y-3">
                        {socialReporters.map((reporter, index) => (
                            <ReporterCard key={reporter.id} reporter={reporter} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
