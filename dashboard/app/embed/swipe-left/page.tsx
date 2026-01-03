"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ThumbsDown, ThumbsUp, RotateCcw, ExternalLink } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const officials = [
    { id: "tim-walz", name: "Tim Walz", title: "Governor", reason: "Oversight Failure: $250M+ Fraud" },
    { id: "keith-ellison", name: "Keith Ellison", title: "Attorney General", reason: "Delayed Action on Warnings" },
    { id: "peggy-flanagan", name: "Peggy Flanagan", title: "Lt. Governor", reason: "Chain of Command" },
    { id: "steve-simon", name: "Steve Simon", title: "Secretary of State", reason: "Electoral Oversight" },
    { id: "julie-blaha", name: "Julie Blaha", title: "State Auditor", reason: "Audit Failures" }
];

function SwipeCard({ official, isTop, onSwipe }: { official: typeof officials[0]; isTop: boolean; onSwipe: (dir: 'left' | 'right') => void }) {
    const [exitX, setExitX] = useState(0);

    const handleDragEnd = (_: never, info: PanInfo) => {
        if (Math.abs(info.offset.x) > 80) {
            setExitX(info.offset.x > 0 ? 500 : -500);
            onSwipe(info.offset.x > 0 ? 'right' : 'left');
        }
    };

    return (
        <motion.div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
            animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
            exit={{ x: exitX, rotate: exitX > 0 ? 20 : -20, opacity: 0 }}
            style={{ zIndex: isTop ? 10 : 5 }}
        >
            <div className="h-full w-full bg-gradient-to-b from-zinc-900 to-red-950 rounded-2xl border border-red-500/30 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-red-400">
                        {official.name.split(' ').map(n => n[0]).join('')}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{official.name}</h2>
                <p className="text-red-400 font-mono text-sm mb-4">{official.title}</p>
                <p className="text-zinc-400 text-sm italic">&ldquo;{official.reason}&rdquo;</p>
            </div>
        </motion.div>
    );
}

export default function EmbedSwipeLeft() {
    const [deck, setDeck] = useState([...officials].reverse());
    const [rejected, setRejected] = useState(0);

    const handleSwipe = useCallback((dir: 'left' | 'right') => {
        if (dir === 'left') setRejected(prev => prev + 1);
        setDeck(prev => prev.slice(0, -1));
    }, []);

    const handleReset = () => {
        setDeck([...officials].reverse());
        setRejected(0);
    };

    const allSwiped = deck.length === 0;

    return (
        <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
            <h1 className="text-xl font-black text-center mb-4 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
                Swipe Left on the Left
            </h1>

            <div className="relative w-full max-w-xs h-[350px] mb-4">
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

                {allSwiped && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800 p-6"
                    >
                        <p className="text-2xl font-bold mb-2">{rejected} Rejected</p>
                        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full text-sm">
                            <RotateCcw className="w-4 h-4" /> Again
                        </button>
                    </motion.div>
                )}
            </div>

            {!allSwiped && (
                <div className="flex items-center gap-6">
                    <button onClick={() => handleSwipe('left')} className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                        <ThumbsDown className="w-6 h-6" />
                    </button>
                    <button onClick={() => handleSwipe('right')} className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                        <ThumbsUp className="w-6 h-6" />
                    </button>
                </div>
            )}

            <a href="/swipe-left" target="_blank" className="mt-4 flex items-center gap-1 text-xs text-zinc-500 hover:text-white">
                <ExternalLink className="w-3 h-3" /> Full Experience
            </a>

            <p className="mt-4 text-[10px] text-zinc-700 font-mono">PROJECT CROSSCHECK</p>
        </main>
    );
}
