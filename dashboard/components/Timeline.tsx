"use client";

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimelineEvent {
    date: string;
    event: string;
    detail: string;
}

interface TimelineProps {
    events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
    return (
        <section className="py-8">
            <h2 className="text-2xl font-bold mb-8 text-neon-blue font-mono border-b border-white/10 pb-2">
                TIMELINE_RECONSTRUCTION
            </h2>

            <div className="relative border-l-2 border-zinc-800 ml-4 space-y-12">
                {events.map((item, index) => {
                    // @ts-expect-error - handling dynamic type extension
                    if (item.type === 'GAP') {
                        return (
                            <div key={index} className="relative pl-8 my-12">
                                {/* Gap Indicator */}
                                <div className="absolute -left-[34px] w-full border-t-2 border-dashed border-zinc-800 flex items-center">
                                    <span className="bg-[#050505] px-2 ml-8 text-xs font-mono text-zinc-500 uppercase flex items-center border border-zinc-800 p-1">
                                        <Clock className="w-3 h-3 mr-2 text-zinc-500" />
                                        {item.event}
                                    </span>
                                </div>
                                <div className="mt-4 p-4 border border-l-4 border-l-neon-red border-zinc-900 bg-red-950/10">
                                    <h4 className="text-neon-red font-mono text-xs uppercase tracking-widest mb-1">
                                        ANOMALY_DETECTED
                                    </h4>
                                    <p className="text-zinc-400 text-sm italic">{item.detail}</p>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="relative pl-8">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-zinc-900 border-2 border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.5)]" />

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <span className="text-neon-blue font-mono text-sm mb-1 block">
                                    {item.date}
                                </span>
                                <h3 className="text-xl font-bold text-white mb-2">{item.event}</h3>
                                <p className="text-zinc-400 max-w-md">{item.detail}</p>
                            </motion.div>
                        </div>
                    );
                })}

                <div className="absolute -left-[5px] bottom-0 w-2 h-2 bg-zinc-800 rounded-full" />
            </div>
        </section>
    );
}
