"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ThumbsDown, ThumbsUp, Share2, RotateCcw, Twitter, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const officials = [
    {
        id: "tim-walz",
        name: "Tim Walz",
        title: "Governor of Minnesota",
        reason: "Oversight Failure: $250M+ in Feeding Our Future fraud occurred under his watch",
        failureDetails: [
            "Failed to act on inspector general warnings",
            "Approved continued funding despite red flags",
            "No accountability measures implemented"
        ],
        image: "/assets/penalty-box/walz.jpg"
    },
    {
        id: "keith-ellison",
        name: "Keith Ellison",
        title: "Attorney General",
        reason: "Delayed prosecution and minimized fraud severity",
        failureDetails: [
            "Slow response to fraud evidence",
            "Limited scope of investigation",
            "Focus on low-level actors"
        ],
        image: "/assets/penalty-box/ellison.jpg"
    },
    {
        id: "peggy-flanagan",
        name: "Peggy Flanagan",
        title: "Lt. Governor",
        reason: "Chain of command complicity",
        failureDetails: [
            "Silent on oversight failures",
            "No public accountability",
            "Part of leadership structure"
        ],
        image: "/assets/penalty-box/flanagan.jpg"
    },
    {
        id: "steve-simon",
        name: "Steve Simon",
        title: "Secretary of State",
        reason: "Electoral system oversight failures",
        failureDetails: [
            "Nonprofit oversight gaps",
            "Registration verification issues",
            "Systemic weakness enabler"
        ],
        image: "/assets/penalty-box/simon.jpg"
    },
    {
        id: "julie-blaha",
        name: "Julie Blaha",
        title: "State Auditor",
        reason: "Audit failures enabled fraud scale",
        failureDetails: [
            "Missed repeated warning signs",
            "Insufficient audit protocols",
            "Failed prevention mandate"
        ],
        image: "/assets/penalty-box/blaha.jpg"
    }
];

interface SwipeCardProps {
    official: typeof officials[0];
    isTop: boolean;
    onSwipe: (dir: 'left' | 'right') => void;
}

function SwipeCard({ official, isTop, onSwipe }: SwipeCardProps) {
    const [exitX, setExitX] = useState(0);

    const handleDragEnd = (_: never, info: PanInfo) => {
        if (Math.abs(info.offset.x) > 100) {
            setExitX(info.offset.x > 0 ? 1000 : -1000);
            onSwipe(info.offset.x > 0 ? 'right' : 'left');
        }
    };

    return (
        <motion.div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20 }}
            animate={{
                scale: isTop ? 1 : 0.95,
                y: isTop ? 0 : 20,
                rotate: 0
            }}
            exit={{
                x: exitX,
                rotate: exitX > 0 ? 30 : -30,
                opacity: 0,
                transition: { duration: 0.3 }
            }}
            whileDrag={{
                rotate: 5,
                scale: 1.02
            }}
            style={{ zIndex: isTop ? 10 : 5 }}
        >
            <div className="h-full w-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-red-950 rounded-3xl border-2 border-red-500/30 overflow-hidden shadow-2xl shadow-red-900/20 flex flex-col">
                {/* Image Section */}
                <div className="relative h-1/2 bg-gradient-to-b from-red-900/50 to-transparent overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500/30 to-black border-4 border-red-500/50 flex items-center justify-center overflow-hidden">
                            {official.image ? (
                                <Image
                                    src={official.image}
                                    alt={official.name}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            ) : null}
                            <span className="text-6xl font-bold text-red-500/50 absolute">
                                {official.name.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                    </div>

                    {/* Swipe Indicators */}
                    <motion.div
                        className="absolute top-8 left-8 px-6 py-2 bg-red-600 text-white font-bold text-2xl rounded-lg border-4 border-red-400 rotate-[-20deg] opacity-0"
                        style={{ opacity: 0 }}
                    >
                        REJECT
                    </motion.div>
                    <motion.div
                        className="absolute top-8 right-8 px-6 py-2 bg-green-600 text-white font-bold text-2xl rounded-lg border-4 border-green-400 rotate-[20deg] opacity-0"
                        style={{ opacity: 0 }}
                    >
                        KEEP
                    </motion.div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-8 flex flex-col text-center">
                    <h2 className="text-4xl font-bold text-white mb-2">{official.name}</h2>
                    <p className="text-xl text-red-400 font-mono mb-6">{official.title}</p>

                    <div className="bg-black/50 rounded-xl p-6 mb-6 border border-red-500/20">
                        <p className="text-lg text-zinc-300 italic mb-4">&ldquo;{official.reason}&rdquo;</p>
                        <div className="space-y-2">
                            {official.failureDetails.map((detail, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                    <span className="text-red-500">✗</span>
                                    {detail}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto text-xs text-zinc-600 font-mono">
                        SWIPE LEFT TO REJECT • SWIPE RIGHT TO KEEP
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function SwipeLeftPage() {
    const [deck, setDeck] = useState([...officials].reverse());
    const [rejected, setRejected] = useState<string[]>([]);
    const [kept, setKept] = useState<string[]>([]);

    const handleSwipe = useCallback((dir: 'left' | 'right') => {
        const current = deck[deck.length - 1];
        if (!current) return;

        if (dir === 'left') {
            setRejected(prev => [...prev, current.id]);
        } else {
            setKept(prev => [...prev, current.id]);
        }

        setDeck(prev => prev.slice(0, -1));
    }, [deck]);

    const handleButtonSwipe = (dir: 'left' | 'right') => {
        handleSwipe(dir);
    };

    const handleReset = () => {
        setDeck([...officials].reverse());
        setRejected([]);
        setKept([]);
    };

    const handleShare = () => {
        const text = `I just rejected ${rejected.length} MN officials on Swipe Left on the Left! Check out the chain of failure: `;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    };

    const allSwiped = deck.length === 0;

    return (
        <main className="min-h-screen bg-black text-white overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-gradient-to-br from-black via-red-950/20 to-black pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_70%)] pointer-events-none" />

            {/* Header */}
            <header className="relative z-50 flex items-center justify-between p-4 md:p-6">
                <Link href="/penalty-box" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-mono">Back to Penalty Box</span>
                </Link>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-bold transition-colors"
                    >
                        <Twitter className="w-4 h-4" />
                        Share
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-black text-center mb-8 bg-gradient-to-r from-red-500 via-white to-red-500 bg-clip-text text-transparent">
                    Swipe Left on the Left
                </h1>
                <p className="text-zinc-400 text-center mb-8 max-w-md">
                    Review the chain of failure. Swipe left to reject, right to keep.
                    <br />
                    <span className="text-red-400 font-mono text-sm">Minnesota deserves accountability.</span>
                </p>

                {/* Card Stack */}
                <div className="relative w-full max-w-md h-[600px] mb-8">
                    <AnimatePresence>
                        {deck.map((official, index) => (
                            <SwipeCard
                                key={official.id}
                                official={official}
                                isTop={index === deck.length - 1}
                                onSwipe={handleSwipe}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {allSwiped && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black rounded-3xl border-2 border-zinc-800 p-8 text-center"
                        >
                            <h2 className="text-3xl font-bold mb-4">Cycle Complete</h2>
                            <div className="flex gap-8 mb-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-red-500">{rejected.length}</div>
                                    <div className="text-sm text-zinc-500">Rejected</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-green-500">{kept.length}</div>
                                    <div className="text-sm text-zinc-500">Kept</div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full font-bold transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Review Again
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-colors"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share Results
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Action Buttons */}
                {!allSwiped && (
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => handleButtonSwipe('left')}
                            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-lg shadow-red-900/50 transition-all hover:scale-110 active:scale-95"
                        >
                            <ThumbsDown className="w-8 h-8" />
                        </button>

                        <button
                            onClick={() => handleButtonSwipe('right')}
                            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center shadow-lg shadow-green-900/50 transition-all hover:scale-110 active:scale-95"
                        >
                            <ThumbsUp className="w-8 h-8" />
                        </button>
                    </div>
                )}

                {/* Progress */}
                {!allSwiped && (
                    <div className="mt-6 text-sm text-zinc-500 font-mono">
                        {officials.length - deck.length + 1} / {officials.length}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="relative z-10 text-center p-4 text-xs text-zinc-600 font-mono">
                PROJECT CROSSCHECK • Built for the people of Minnesota
            </footer>
        </main>
    );
}
