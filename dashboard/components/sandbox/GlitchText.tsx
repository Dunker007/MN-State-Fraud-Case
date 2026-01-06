"use client";

import { useEffect, useState } from 'react';

export default function GlitchText({ text, className = "" }: { text: string, className?: string }) {
    const [display, setDisplay] = useState(text);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";

    useEffect(() => {
        let iterations = 0;
        const interval = setInterval(() => {
            setDisplay(
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iterations) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iterations >= text.length) {
                clearInterval(interval);
            }
            iterations += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [text]);

    return <span className={`font-mono ${className}`}>{display}</span>;
}
