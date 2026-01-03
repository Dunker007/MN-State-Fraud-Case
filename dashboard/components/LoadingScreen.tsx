"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
    message?: string;
    subMessage?: string;
    variant?: 'default' | 'intel' | 'penalty' | 'database' | 'risk' | 'patterns' | 'paid_leave';
}

const variantConfig = {
    default: {
        color: 'text-neon-blue',
        bgColor: 'from-blue-950/20',
        borderColor: 'border-blue-500/30',
        glowColor: 'shadow-blue-500/20',
        messages: [
            'INITIALIZING_SYSTEM...',
            'LOADING_EVIDENCE_MATRIX...',
            'ESTABLISHING_SECURE_CHANNEL...',
        ]
    },
    intel: {
        color: 'text-emerald-400',
        bgColor: 'from-emerald-950/20',
        borderColor: 'border-emerald-500/30',
        glowColor: 'shadow-emerald-500/20',
        messages: [
            'SCANNING_HUNTER_PROTOCOL_FEEDS...',
            'PHASE_ROTATION_ACTIVE...',
            'AGGREGATING_INTEL_SOURCES...',
        ]
    },
    penalty: {
        color: 'text-red-500',
        bgColor: 'from-red-950/20',
        borderColor: 'border-red-500/30',
        glowColor: 'shadow-red-500/20',
        messages: [
            'LOADING_CHAIN_OF_FAILURE...',
            'MAPPING_ACCOUNTABILITY_MATRIX...',
            'SWIPE_PROTOCOL_ENGAGED...',
        ]
    },
    database: {
        color: 'text-purple-400',
        bgColor: 'from-purple-950/20',
        borderColor: 'border-purple-500/30',
        glowColor: 'shadow-purple-500/20',
        messages: [
            'QUERYING_MN_LICENSE_RECORDS...',
            'INDEXING_19,419_PROVIDERS...',
            'CROSS_REFERENCING_DATABASE...',
        ]
    },
    risk: {
        color: 'text-amber-400',
        bgColor: 'from-amber-950/20',
        borderColor: 'border-amber-500/30',
        glowColor: 'shadow-amber-500/20',
        messages: [
            'ANALYZING_HIGH_VALUE_TARGETS...',
            'CALCULATING_RISK_MATRICES...',
            'FRAUD_PATTERN_DETECTION...',
        ]
    },
    patterns: {
        color: 'text-cyan-400',
        bgColor: 'from-cyan-950/20',
        borderColor: 'border-cyan-500/30',
        glowColor: 'shadow-cyan-500/20',
        messages: [
            'MAPPING_NETWORK_TOPOLOGY...',
            'TEMPORAL_ANALYSIS_RUNNING...',
            'CLUSTER_DETECTION_ACTIVE...',
        ]
    },
    paid_leave: {
        color: 'text-orange-400',
        bgColor: 'from-orange-950/20',
        borderColor: 'border-orange-500/30',
        glowColor: 'shadow-orange-500/20',
        messages: [
            'CALCULATING_INSOLVENCY_CLOCK...',
            'TRACKING_BURN_RATE...',
            'MONITORING_PROGRAM_STATUS...',
        ]
    }
};

export default function LoadingScreen({ message, subMessage, variant = 'default' }: LoadingScreenProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const [dots, setDots] = useState('');
    const config = variantConfig[variant];

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % config.messages.length);
        }, 2000);

        const dotInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 400);

        return () => {
            clearInterval(messageInterval);
            clearInterval(dotInterval);
        };
    }, [config.messages.length]);

    const displayMessage = message || config.messages[messageIndex];

    return (
        <div className={`min-h-[400px] flex items-center justify-center bg-gradient-to-b ${config.bgColor} to-transparent rounded-xl border ${config.borderColor} p-8`}>
            <div className="text-center space-y-6">
                {/* Animated Logo/Icon */}
                <motion.div
                    className="relative mx-auto w-24 h-24"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* Outer Ring */}
                    <div className={`absolute inset-0 rounded-full border-2 ${config.borderColor} animate-spin`} style={{ animationDuration: '8s' }} />

                    {/* Inner Ring */}
                    <div className={`absolute inset-3 rounded-full border ${config.borderColor} animate-spin`} style={{ animationDuration: '4s', animationDirection: 'reverse' }} />

                    {/* Center Dot */}
                    <div className={`absolute inset-8 rounded-full bg-current ${config.color} animate-pulse shadow-lg ${config.glowColor}`} />

                    {/* Crosshairs */}
                    <div className={`absolute top-1/2 left-0 right-0 h-px bg-current ${config.color} opacity-30`} />
                    <div className={`absolute left-1/2 top-0 bottom-0 w-px bg-current ${config.color} opacity-30`} />
                </motion.div>

                {/* Message */}
                <div className="space-y-2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={displayMessage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`text-sm font-mono font-bold ${config.color} tracking-wider`}
                        >
                            {displayMessage}{dots}
                        </motion.div>
                    </AnimatePresence>

                    {subMessage && (
                        <p className="text-xs text-zinc-500 font-mono">{subMessage}</p>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="w-48 mx-auto h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full bg-current ${config.color}`}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ width: '50%' }}
                    />
                </div>

                {/* Branding */}
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.3em]">
                    PROJECT CROSSCHECK
                </div>
            </div>
        </div>
    );
}
