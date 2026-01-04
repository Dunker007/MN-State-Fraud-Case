"use client";

import { Suspense, useState, useEffect, useCallback } from 'react';
import DesktopSidebar from '@/components/DesktopSidebar';
import WhistleblowerFeed from '@/components/WhistleblowerFeed';
import ConspiracyGraph from '@/components/ConspiracyGraph';
import LinkedDossiers from '@/components/LinkedDossiers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const officials = [
    { name: "Tim Walz", title: "Governor", reason: "Oversight Failure: $250M+ Fraud" },
    { name: "Keith Ellison", title: "Attorney General", reason: "Delayed Action on Warnings" },
    { name: "Peggy Flanagan", title: "Lt. Governor", reason: "Chain of Command" },
    { name: "Steve Simon", title: "Secretary of State", reason: "Electoral Oversight" },
    { name: "Julie Blaha", title: "State Auditor", reason: "Audit Failures" }
];

function SwipeDeck() {
    const [currentIndex, setCurrentIndex] = useState(officials.length - 1);
    const [swipedCards, setSwipedCards] = useState<Record<number, 'left' | 'right' | 'up'>>({});

    const swipe = useCallback((dir: 'left' | 'right' | 'up') => {
        if (currentIndex < 0) return;

        setSwipedCards(prev => ({
            ...prev,
            [currentIndex]: dir
        }));

        setTimeout(() => {
            setCurrentIndex(prev => prev - 1);
        }, 200);
    }, [currentIndex]);

    const handleReset = useCallback(() => {
        setCurrentIndex(officials.length - 1);
        setSwipedCards({});
    }, []);

    // Auto-scroll effect (Vertical Cycle)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentIndex >= 0) {
                swipe('up'); // Vertical scroll as requested
            } else {
                handleReset(); // Cycle through the pile
            }
        }, 6000);

        return () => clearTimeout(timer);
    }, [currentIndex, swipe, handleReset]);

    if (currentIndex < 0) {
        return (
            <div className="relative flex-1 rounded-lg border border-red-500/30 flex flex-col items-center justify-center bg-black/50 p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Cycle Complete</h3>
                <p className="text-sm text-gray-400 mb-4">You have rejected the chain of failure.</p>
                <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-cyan-600 text-white rounded-full text-sm font-bold hover:bg-cyan-500 transition-colors"
                >
                    Review Again
                </button>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col">
            <div className="relative flex-1 rounded-lg border border-red-500/30 bg-black/50 overflow-hidden">
                {officials.map((official, index) => {
                    // Only render if it's the current or one of the next few (below)
                    // Or render all but hidden?
                    // We definitely render the current one and the ones *swiped* (to animate out) 
                    // and the ones below (to stack).

                    // Optimization: Only render current, current-1, and swiped ones?
                    // Actually, just render all. List is small (5).

                    const isSwiped = !!swipedCards[index];

                    // Stack logic
                    // If swiped: transform based on direction.
                    // If current: transform none (or small hover/float).
                    // If below: scale down.
                    // Note: index 0 is bottom. index N is top.
                    // 'currentIndex' moves down from N to 0.

                    // If index > currentIndex && !isSwiped: Should not happen if logic is correct (those are future? no past?)
                    // If we decrement index, the ones > currentIndex are "Swiped".
                    // So we utilize `swipedCards`.

                    let style: React.CSSProperties = {};
                    let className = "absolute inset-0 bg-gradient-to-b from-black/80 to-red-900/80 rounded-lg flex flex-col items-center justify-center text-white p-4 transition-transform duration-500 ease-out shadow-2xl origin-bottom";

                    if (isSwiped) {
                        const dir = swipedCards[index];
                        let transform = '';

                        if (dir === 'up') {
                            transform = 'translateY(-150%) rotate(0deg)';
                        } else {
                            const rotate = dir === 'left' ? -30 : 30;
                            const x = dir === 'left' ? -150 : 150;
                            transform = `translateX(${x}%) rotate(${rotate}deg)`;
                        }

                        style = {
                            transform,
                            opacity: 0,
                            zIndex: 100 + index
                        };
                    } else if (index === currentIndex) {
                        style = {
                            transform: 'scale(1) translateY(0)',
                            zIndex: 10 + index,
                            opacity: 1
                        };
                    } else if (index < currentIndex) {
                        // Cards below
                        const diff = currentIndex - index;
                        // Limit depth visible
                        if (diff > 3) return null;
                        style = {
                            transform: `scale(${1 - diff * 0.05}) translateY(${diff * 10}px)`,
                            zIndex: 10 + index,
                            opacity: 1 - diff * 0.2
                        };
                    } else {
                        // Index > currentIndex but not swiped? Should be invisible or hidden.
                        return null;
                    }

                    return (
                        <div key={index} className={className} style={style}>
                            <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 border-2 border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
                                { /* Placeholder for animation frame */}
                                <div className="text-3xl">🏛️</div>
                            </div>
                            <h3 className="text-xl font-bold text-center">{official.name}</h3>
                            <p className="text-sm text-gray-300 mb-4 font-mono">{official.title}</p>

                            <div className={`mt-2 p-2 bg-red-950/50 border border-red-500/30 rounded text-center transition-opacity duration-300 ${isSwiped ? 'opacity-100' : 'opacity-0'}`}>
                                <p className="text-xs text-red-300 font-bold uppercase">REJECTED</p>
                                <p className="text-[10px] text-red-200">{official.reason}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={() => swipe('left')}
                    className="flex-1 px-4 py-3 bg-red-600/90 text-white font-bold rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                    🚫 SWIPE LEFT
                </button>
                <button
                    onClick={() => swipe('right')} // Or confirm? User said "Swipe Right Checkmark"
                    className="flex-1 px-4 py-3 bg-blue-600/90 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center border border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                    ✅ KEEP?
                </button>
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-zinc-800 text-white text-xs font-mono rounded hover:bg-zinc-700 transition">
                Share Rejections
            </button>
        </div>
    );
}

export default function PenaltyBoxPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-[#ededed] font-mono selection:bg-blue-500 selection:text-black">
            {/* Styles for Glitch Effect (Scoped) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .glitch-effect {
                    position: relative;
                }
                .glitch-effect::before,
                .glitch-effect::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .glitch-effect::before {
                    left: 2px;
                    text-shadow: -1px 0 red;
                    clip: rect(24px, 550px, 90px, 0);
                    animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
                }
                .glitch-effect::after {
                    left: -2px;
                    text-shadow: -1px 0 blue;
                    clip: rect(85px, 550px, 140px, 0);
                    animation: glitch-anim-2 3s infinite linear alternate-reverse;
                }
                @keyframes glitch-anim-1 {
                    0% { clip: rect(20px, 9999px, 80px, 0); }
                    20% { clip: rect(60px, 9999px, 10px, 0); }
                    40% { clip: rect(100px, 9999px, 120px, 0); }
                    60% { clip: rect(40px, 9999px, 60px, 0); }
                    80% { clip: rect(80px, 9999px, 20px, 0); }
                    100% { clip: rect(10px, 9999px, 90px, 0); }
                }
                @keyframes glitch-anim-2 {
                    0% { clip: rect(120px, 9999px, 10px, 0); }
                    20% { clip: rect(10px, 9999px, 100px, 0); }
                    40% { clip: rect(80px, 9999px, 20px, 0); }
                    60% { clip: rect(20px, 9999px, 120px, 0); }
                    80% { clip: rect(100px, 9999px, 60px, 0); }
                    100% { clip: rect(60px, 9999px, 80px, 0); }
                }
            `}} />

            {/* Sidebar */}
            <Suspense fallback={null}>
                <DesktopSidebar />
            </Suspense>

            {/* Mobile Header - MOVED TO GLOBAL LAYOUT */}
            {/* <div className="lg:hidden">
                <CrosscheckHeader />
            </div> */}

            {/* Main Content */}
            <div className="lg:ml-64 transition-all duration-300 min-h-screen flex flex-col justify-center">
                <div className="w-full max-w-[95%] lg:max-w-none mx-auto px-4 lg:px-8 py-6">

                    {/* Desktop Header - MOVED TO GLOBAL LAYOUT */}
                    {/* <div className="hidden lg:block mb-4 -mx-4 lg:-mx-8">
                        <CrosscheckHeader />
                    </div> */}

                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                            THE PENALTY BOX <span className="text-red-500">CHAIN OF FAILURE</span>
                        </h1>
                    </div>

                    {/* Symmetric Grid: Feed | Video (larger) | Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">

                        {/* Left Panel: Swipe Left on the Left */}
                        <div className="lg:col-span-3 bg-black/90 rounded-xl shadow-2xl p-6 flex flex-col border border-white/10 h-[725px]">
                            <h2
                                className="text-xl md:text-2xl font-bold text-white mb-2 glitch-effect"
                                data-text="Swipe Left on the Left"
                            >
                                Swipe Left on the Left
                            </h2>
                            <p className="text-xs text-gray-300 mb-4">
                                Reject the chain of failure.
                            </p>

                            {/* Swipe Deck */}
                            <SwipeDeck />

                            <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest text-center">
                                Campaign Active
                            </p>
                            <a
                                href="/swipe-left"
                                className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-500 rounded-full text-sm font-bold transition-colors border border-red-500/50"
                            >
                                Launch Full Experience →
                            </a>
                        </div>

                        {/* Center Video Hero (50% width) */}
                        <div className="lg:col-span-6 relative overflow-hidden bg-black rounded-xl shadow-2xl h-[725px] border border-white/10 group">
                            <video
                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                autoPlay
                                loop
                                muted
                                playsInline
                            >
                                <source src="/assets/videos/penalty-hero.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

                            {/* Overlay Stats */}
                            <div className="absolute bottom-6 left-6 text-white font-mono pointer-events-none">
                                <span className="px-2 py-0.5 bg-blue-950/50 border border-blue-500/30 text-blue-400 rounded font-bold uppercase text-xs">
                                    Surveillance Active
                                </span>
                            </div>
                        </div>

                        {/* Right Panel: Live 480 Whistleblowers Feed (FINAL) */}
                        <div className="lg:col-span-3 bg-black/90 rounded-xl shadow-2xl p-6 flex flex-col h-[725px] border border-white/10">
                            <h2
                                className="text-xl md:text-2xl font-bold text-white mb-4 glitch-effect"
                                data-text="Live: 480 Whistleblowers"
                            >
                                Live: 480 Whistleblowers
                                <span className="block text-sm font-normal text-cyan-400 font-mono mt-1">(@Minnesota_DHS)</span>
                            </h2>
                            <div className="flex-1 overflow-hidden rounded-lg bg-[#000] h-full">
                                <WhistleblowerFeed />
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                Voices from 480+ Minnesota state staff exposing fraud & cover-up.
                            </p>
                        </div>
                    </div>

                    {/* NEW: Network Graph Section (Full Width) */}
                    <div className="max-w-[1600px] mx-auto mt-12 mb-12">
                        <div className="mb-8 text-center flex flex-col items-center">
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter flex items-center justify-center gap-3 mb-4">
                                <span className="text-red-600">CONSPIRACY</span> <span className="text-white">TOPOLOGY</span>
                                <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full not-italic tracking-normal transform translate-y-1">Live Data</span>
                            </h2>
                            <p className="text-zinc-400 font-mono text-sm max-w-2xl mx-auto leading-relaxed">
                                Mapping the flow of oversight failures from the Governor's office down to the specific DHS nodes responsible for the $250M diversion.
                            </p>
                        </div>
                        <div className="h-[900px] w-full">
                            <ConspiracyGraph />
                        </div>

                        {/* Source Evidence Links */}
                        <div className="mt-4 flex items-center justify-end gap-4 text-xs font-mono text-zinc-500">
                            <span className="uppercase tracking-widest text-zinc-600">Source Evidence:</span>
                            <a href="/assets/evidence/org chart.pdf" target="_blank" className="hover:text-red-400 flex items-center gap-1 transition-colors">
                                <span className="border-b border-zinc-700 hover:border-red-500">DHS_Org_Chart_Full.pdf</span>
                            </a>
                            <span className="text-zinc-700">|</span>
                            <a href="/assets/evidence/org chart pg1.png" target="_blank" className="hover:text-red-400 flex items-center gap-1 transition-colors">
                                <span className="border-b border-zinc-700 hover:border-red-500">Page_1_Scan.png</span>
                            </a>
                            <a href="/assets/evidence/org chart pg2.png" target="_blank" className="hover:text-red-400 flex items-center gap-1 transition-colors">
                                <span className="border-b border-zinc-700 hover:border-red-500">Page_2_Scan.png</span>
                            </a>
                        </div>
                    </div>

                    {/* NEW: Linked Dossiers Section */}
                    <LinkedDossiers />

                </div>
            </div>
        </main>
    );
}
