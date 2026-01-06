"use client";

import { useEffect, useState, useRef } from 'react';

interface FundGaugeProps {
    currentBalance: number;  // Current fund balance in millions
    initialBalance: number;  // Starting fund balance in millions (e.g., 500)
}

export default function FundGauge({ currentBalance, initialBalance }: FundGaugeProps) {
    const [animatedPercent, setAnimatedPercent] = useState(100);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const healthPercent = Math.max(0, Math.min(100, (currentBalance / initialBalance) * 100));

    // Animate on mount
    useEffect(() => {
        const duration = 1500;
        const start = Date.now();
        const startValue = 100;
        const endValue = healthPercent;

        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            setAnimatedPercent(startValue + (endValue - startValue) * eased);

            if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
    }, [healthPercent]);

    // Draw gauge on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height - 40;
        const radius = Math.min(width, height) * 0.4;

        ctx.clearRect(0, 0, width, height);

        // Background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 30;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Determine color based on health
        let color = '#00f3ff'; // Neon blue (healthy)
        if (animatedPercent < 50) color = '#f59e0b'; // Amber (warning)
        if (animatedPercent < 25) color = '#ff003c'; // Neon red (critical)

        // Progress arc
        const endAngle = Math.PI + (Math.PI * (animatedPercent / 100));
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = 30;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Center text
        ctx.fillStyle = color;
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(animatedPercent)}%`, centerX, centerY - 20);

        // Label
        ctx.fillStyle = '#666';
        ctx.font = '12px monospace';
        ctx.fillText('FUND HEALTH', centerX, centerY + 20);

    }, [animatedPercent]);

    // Status text
    let status = 'OPERATIONAL';
    let statusColor = 'text-cyan-400';
    if (healthPercent < 50) { status = 'STRAINED'; statusColor = 'text-amber-400'; }
    if (healthPercent < 25) { status = 'CRITICAL'; statusColor = 'text-red-500'; }

    return (
        <div className="relative bg-black/50 border border-zinc-800 rounded-xl p-6 flex flex-col items-center">
            <canvas
                ref={canvasRef}
                width={300}
                height={200}
                className="max-w-full"
            />
            <div className="mt-4 text-center">
                <div className={`text-2xl font-black tracking-widest ${statusColor}`}>
                    {status}
                </div>
                <div className="text-xs text-zinc-600 font-mono mt-1">
                    ${currentBalance.toFixed(1)}M / ${initialBalance}M
                </div>
            </div>
        </div>
    );
}
