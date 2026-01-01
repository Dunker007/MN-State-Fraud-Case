"use client";

import { motion } from "framer-motion";

interface AlibiBannerProps {
    message: string;
}

export default function AlibiBanner({ message }: AlibiBannerProps) {
    return (
        <div className="w-full bg-[#ff003c] overflow-hidden border-b-2 border-black z-50 relative">
            <div className="flex whitespace-nowrap py-2">
                <motion.div
                    className="flex space-x-8 text-black font-bold font-mono text-sm tracking-widest uppercase"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 20,
                    }}
                >
                    {/* Repeated message for seamless loop */}
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="flex items-center">
                            <span className="mr-8">⚠ {message}</span>
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
