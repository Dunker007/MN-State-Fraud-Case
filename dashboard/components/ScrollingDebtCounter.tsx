'use client';

import { motion, useSpring, useMotionValue, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

const DEBT_START = 8990000000;
const DEBT_END = 9320000000; // Updated to exceed 9B significantly
const DURATION = 35;

export function ScrollingDebtCounter() {
    // We use a motion value to drive the animation
    const count = useMotionValue(DEBT_START);
    const rounded = useSpring(count, { stiffness: 50, damping: 20 });
    const [displayValue, setDisplayValue] = useState(format(DEBT_START));

    function format(value: number) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
            notation: 'compact',
            compactDisplay: 'short'
        }).format(value);
    }

    useEffect(() => {
        // Simple session check
        const isSession = sessionStorage.getItem('crosscheck_session');
        if (!isSession) {
            sessionStorage.setItem('crosscheck_session', 'active');
            count.set(DEBT_START);
        }

        // Animate to end
        const controls = animate(count, DEBT_END, { duration: DURATION });
        return controls.stop;
    }, [count]);

    // Subscribe to updates to format the text
    useEffect(() => {
        return rounded.on("change", (latest) => {
            setDisplayValue(format(latest));
        });
    }, [rounded]);

    return (
        <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Est. Total Diversion</span>
            <motion.div className="text-2xl lg:text-3xl font-black font-mono text-neon-red drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                {displayValue}
            </motion.div>
        </div>
    );
}
