"use client";

import { motion } from "framer-motion";
import { Twitter, Youtube, MessageCircle, TrendingUp, ExternalLink, Clock, Bookmark, BookmarkCheck, ArrowRight } from "lucide-react";
import { useState } from "react";

interface SocialPost {
    id: string;
    platform: "twitter" | "youtube" | "reddit";
    author: string;
    content: string;
    link: string;
    timestamp: string;
    engagement: number;
    type: string;
}

export default function SocialMediaFeed() {
    const [filter, setFilter] = useState<"all" | "twitter" | "youtube" | "reddit">("all");
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    const [boardPosts, setBoardPosts] = useState<Set<string>>(new Set());

    const handleSavePost = (postId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSavedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    const handleMoveToBoard = (post: SocialPost, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setBoardPosts(prev => new Set(prev).add(post.id));
        console.log('Added to investigation board:', post.content);
    };

    // Mock data - in production this would come from API
    const posts: SocialPost[] = [
        {
            id: "1",
            platform: "youtube",
            author: "Nick Shirley",
            content: "New investigation video: Inside Minnesota's $250M Fraud Case - The Dirty Dozen Exposed",
            link: "https://youtube.com/@NickShirley",
            timestamp: "2h ago",
            engagement: 45000,
            type: "video"
        },
        {
            id: "2",
            platform: "twitter",
            author: "@MinnesotaWatch",
            content: "BREAKING: DHS admits internal controls 'failed to prevent' massive fraud scheme. Optum audit underway.",
            link: "https://twitter.com",
            timestamp: "4h ago",
            engagement: 1200,
            type: "thread"
        },
        {
            id: "3",
            platform: "reddit",
            author: "u/MNPolitics",
            content: "Megathread: Federal indictments unsealed for Housing Stabilization fraud ring",
            link: "https://reddit.com/r/minnesota",
            timestamp: "6h ago",
            engagement: 340,
            type: "discussion"
        },
        {
            id: "4",
            platform: "twitter",
            author: "@AlphaNewsAlerts",
            content: "FBI raids connected to 14 DHS programs. Full list of 'Dirty Dozen +2' now public.",
            link: "https://twitter.com",
            timestamp: "8h ago",
            engagement: 890,
            type: "news"
        },
        {
            id: "5",
            platform: "youtube",
            author: "Alpha News",
            content: "Interview: Whistleblower reveals DHS knew about fraud for months before action",
            link: "https://youtube.com",
            timestamp: "12h ago",
            engagement: 23000,
            type: "video"
        }
    ];

    const platformIcons = {
        twitter: Twitter,
        youtube: Youtube,
        reddit: MessageCircle
    };

    const platformColors = {
        twitter: "text-sky-400",
        youtube: "text-red-500",
        reddit: "text-orange-500"
    };

    const filteredPosts = filter === "all" ? posts : posts.filter(p => p.platform === filter);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                    <div>
                        <h2 className="text-xl font-bold text-white font-mono">SOCIAL_INTEL_FEED</h2>
                        <p className="text-xs text-zinc-500 font-mono">
                            Tracking Twitter, YouTube, Reddit
                        </p>
                    </div>
                </div>

                {/* Platform Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1 text-xs font-mono rounded transition-colors ${filter === "all"
                            ? "bg-purple-950/50 text-purple-400 border border-purple-900"
                            : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        ALL
                    </button>
                    <button
                        onClick={() => setFilter("twitter")}
                        className={`px-3 py-1 text-xs font-mono rounded transition-colors ${filter === "twitter"
                            ? "bg-sky-950/50 text-sky-400 border border-sky-900"
                            : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <Twitter className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setFilter("youtube")}
                        className={`px-3 py-1 text-xs font-mono rounded transition-colors ${filter === "youtube"
                            ? "bg-red-950/50 text-red-400 border border-red-900"
                            : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <Youtube className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setFilter("reddit")}
                        className={`px-3 py-1 text-xs font-mono rounded transition-colors ${filter === "reddit"
                            ? "bg-orange-950/50 text-orange-400 border border-orange-900"
                            : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <MessageCircle className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Status Line (Matching LiveNewsFeed layout) */}
            <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono mb-3">
                <Clock className="w-3 h-3" />
                Monitoring active
                <span className="text-zinc-700">•</span>
                <span>Real-time stream</span>
            </div>

            {/* Posts Feed */}
            <div className="space-y-2 h-[500px] overflow-y-auto pr-2">
                {filteredPosts.map((post, index) => {
                    const Icon = platformIcons[post.platform];
                    const colorClass = platformColors[post.platform];

                    return (
                        <motion.a
                            key={post.id}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="block bg-zinc-900/50 border border-zinc-800 p-3 rounded hover:border-zinc-600 hover:bg-zinc-900 transition-all group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className={`w-4 h-4 ${colorClass}`} />
                                        <span className="text-xs text-white font-bold">
                                            {post.author}
                                        </span>
                                        <span className="text-zinc-700">•</span>
                                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.timestamp}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase`}>
                                            {post.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-300 line-clamp-2 group-hover:text-white transition-colors">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[10px] text-zinc-600">
                                            {post.engagement.toLocaleString()} interactions
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={(e) => handleSavePost(post.id, e)}
                                        className={`p-2 rounded transition-colors ${savedPosts.has(post.id)
                                            ? 'bg-amber-950/50 text-amber-400 hover:bg-amber-950'
                                            : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-amber-400'
                                            }`}
                                        title={savedPosts.has(post.id) ? "Saved" : "Save link"}
                                    >
                                        {savedPosts.has(post.id) ? (
                                            <BookmarkCheck className="w-4 h-4" />
                                        ) : (
                                            <Bookmark className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => handleMoveToBoard(post, e)}
                                        disabled={boardPosts.has(post.id)}
                                        className={`p-2 rounded transition-colors ${boardPosts.has(post.id)
                                            ? 'bg-green-950/50 text-green-400'
                                            : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-cyan-400'
                                            }`}
                                        title={boardPosts.has(post.id) ? "On board" : "Move to investigation board"}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                                </div>
                            </div>
                        </motion.a>
                    );
                })}
            </div>
        </motion.section>
    );
}
