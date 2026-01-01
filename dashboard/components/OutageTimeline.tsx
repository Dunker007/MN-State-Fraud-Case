"use client";

import { motion } from "framer-motion";

const EVENTS = [
    { date: "Oct 9", title: "Secret Suspension", type: "HIDDEN", desc: "Internal order issued (14 Entities)" },
    { date: "Oct 25", title: "DHS Inaction", type: "NEUTRAL", desc: "No public updates despite internal knowledge" },
    { date: "Nov 15", title: "FBI Raids", type: "HIDDEN", desc: "Prestige Health raided. Lookup 'Active'" },
    { date: "Nov 29", title: "Baseline Check", type: "NEUTRAL", desc: "System operational. Status 'Active'" },
    { date: "Dec 30", title: "THE ALIBI EVENT", type: "CRITICAL", desc: "Mass revocations. System goes offline." }
];

export default function OutageTimeline() {
    return (
        <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
            <div className="min-w-[800px] flex items-center justify-between relative px-12 pt-12">
                {/* Line */}
                <div className="absolute left-0 right-0 top-[59px] h-0.5 bg-zinc-800 z-0" />

                {EVENTS.map((ev, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative z-10 flex flex-col items-center text-center w-32 group"
                    >
                        <div className={`w-4 h-4 rounded-full border-2 mb-4 bg-black transition-all group-hover:scale-125 ${ev.type === 'CRITICAL' ? 'border-neon-red shadow-[0_0_10px_red]' :
                                ev.type === 'HIDDEN' ? 'border-amber-500' :
                                    'border-zinc-500'
                            }`} />

                        <div className="text-xs font-mono font-bold text-white mb-1">{ev.date}</div>
                        <div className={`text-xs font-bold uppercase mb-2 ${ev.type === 'CRITICAL' ? 'text-neon-red' :
                                ev.type === 'HIDDEN' ? 'text-amber-500' :
                                    'text-zinc-500'
                            }`}>
                            {ev.title}
                        </div>
                        <div className="text-[10px] text-zinc-600 px-2 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                            {ev.desc}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
