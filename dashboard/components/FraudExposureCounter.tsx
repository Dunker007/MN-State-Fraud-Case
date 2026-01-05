"use client";

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DollarSign, AlertTriangle, Skull, Building2, Users, Baby, Activity, Car, Brain } from 'lucide-react';
import ClaimProofButton from './ClaimProofButton';

interface FraudCategory {
    id: string;
    name: string;
    amount: number;
    icon: typeof DollarSign;
    color: string;
    description: string;
    status?: 'RAID' | 'PAUSED' | 'AUDIT';
}

// Updated with official 14 High-Risk Programs plus FOF
const fraudCategories: FraudCategory[] = [
    {
        id: 'hss',
        name: 'Housing Stabilization',
        amount: 850_000_000,
        icon: Building2,
        color: 'text-red-500',
        description: 'GROUND ZERO - Active Dec 2025 FBI Raids',
        status: 'RAID'
    },
    {
        id: 'eidbi',
        name: 'Autism Services (EIDBI)',
        amount: 720_000_000,
        icon: Brain,
        color: 'text-red-500',
        description: 'Major Somali network nexus - Active Raids',
        status: 'RAID'
    },
    {
        id: 'pca',
        name: 'Personal Care (PCA)',
        amount: 620_000_000,
        icon: Users,
        color: 'text-amber-500',
        description: 'Ghost employee scheme - Under Optum Audit'
    },
    {
        id: 'adult-day',
        name: 'Adult Day Care',
        amount: 540_000_000,
        icon: Activity,
        color: 'text-red-500',
        description: 'Licensing paused 2 years - Alpha News viral video',
        status: 'PAUSED'
    },
    {
        id: 'nemt',
        name: 'NEMT (Taxi Fraud)',
        amount: 380_000_000,
        icon: Car,
        color: 'text-amber-500',
        description: 'Fake rides, phantom trips - Under Audit'
    },
    {
        id: 'fof',
        name: 'Feeding Our Future',
        amount: 250_000_000,
        icon: Baby,
        color: 'text-purple-500',
        description: 'Child nutrition - 70+ defendants indicted'
    },
    {
        id: 'other-hcbs',
        name: 'Other HCBS (8 more)',
        amount: 1_370_000_000,
        icon: AlertTriangle,
        color: 'text-yellow-500',
        description: 'ARMHS, ICS, CFSS, IRTS, IHS + 3 more'
    },
    {
        id: 'ccap',
        name: 'Daycare CCAP',
        amount: 1_800_000_000,
        icon: Baby,
        color: 'text-purple-500',
        description: 'Child Care Assistance - ongoing investigations'
    },
];

const TOTAL_FRAUD = fraudCategories.reduce((sum, cat) => sum + cat.amount, 0);

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) =>
        Math.round(latest).toLocaleString()
    );
    const [displayValue, setDisplayValue] = useState<string>('0');

    useEffect(() => {
        const controls = animate(count, value, { duration });
        const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
        return () => {
            controls.stop();
            unsubscribe();
        };
    }, [value, duration, count, rounded]);

    return <span>{displayValue}</span>;
}

export default function FraudExposureCounter() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-2">
                <Skull className="w-6 h-6 text-neon-red" />
                <div>
                    <h2 className="text-xl font-bold text-white font-mono tracking-tight">
                        FRAUD_EXPOSURE_MATRIX
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        Estimated Total Fraud Loss | Federal Prosecutor Estimates
                    </p>
                </div>
            </div>

            {/* Main Counter */}
            <div className="bg-black border border-zinc-800 p-3 relative overflow-hidden h-full">
                {/* Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-transparent to-transparent" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-3xl rounded-full" />

                <div className="relative z-10">
                    {/* Total Counter */}
                    <div className="text-center mb-4">
                        <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1">
                            TOTAL ESTIMATED FRAUD EXPOSURE
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-neon-red" />
                            <motion.div
                                className="text-3xl md:text-5xl font-black text-white font-mono tracking-tighter"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                {isVisible && <AnimatedCounter value={TOTAL_FRAUD} duration={3} />}
                            </motion.div>
                            <ClaimProofButton
                                claim={{
                                    id: 'total-fraud-exposure',
                                    type: 'financial',
                                    statement: 'Estimated $9+ Billion in total fraud exposure across Minnesota welfare programs',
                                    evidence: {
                                        primary_source: 'Federal Prosecutors / The Hill / AP / CBS News',
                                        verification_url: 'https://thehill.com/',
                                        calculation: {
                                            housing_stabilization: '$850M',
                                            autism_eidbi: '$720M',
                                            personal_care: '$620M',
                                            adult_day_care: '$540M',
                                            nemt_taxi: '$380M',
                                            feeding_our_future: '$250M',
                                            other_hcbs_8_programs: '$1.37B',
                                            daycare_ccap: '$1.8B',
                                            total: '$6.53B (tracked) + additional untracked = $9B+ estimate'
                                        }
                                    },
                                    verification_steps: [
                                        'Federal prosecutors announced $9B estimate in Dec 2024',
                                        '14 High-Risk Programs identified by Gov. Walz Executive Order Oct 2025',
                                        'Optum third-party audit initiated',
                                        'Cross-reference with DOJ indictments and FBI raid announcements'
                                    ],
                                    legal_citation: 'Federal Court filings, District of Minnesota'
                                }}
                            />
                        </div>
                        <div className="text-neon-red text-lg font-mono mt-1 animate-pulse">
                            $9+ BILLION
                        </div>
                        <div className="text-zinc-600 text-[10px] font-mono mt-0.5">
                            Source: Federal Prosecutor Estimates (Dec 2024)
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                        {fraudCategories.map((category, index) => {
                            const Icon = category.icon;
                            const percentage = ((category.amount / TOTAL_FRAUD) * 100).toFixed(1);

                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="bg-zinc-900/50 border border-zinc-800 p-2.5 rounded hover:border-zinc-600 transition-colors group relative"
                                >
                                    {/* Number Badge */}
                                    <div className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-zinc-800 text-[9px] font-bold text-white border border-zinc-700">
                                        {index + 1}
                                    </div>

                                    <div className="flex items-center gap-2 mb-1 pr-4">
                                        <Icon className={`w-3 h-3 ${category.color}`} />
                                        <span className="text-[10px] font-mono text-zinc-400 truncate">
                                            {category.name}
                                        </span>
                                    </div>
                                    <div className={`text-base font-bold font-mono ${category.color}`}>
                                        ${(category.amount / 1_000_000_000).toFixed(2)}B
                                    </div>
                                    <div className="text-[9px] text-zinc-600 font-mono mt-0.5">
                                        {percentage}% of total
                                    </div>

                                    {/* Progress bar */}
                                    <div className="h-0.5 bg-zinc-800 rounded mt-1.5 overflow-hidden">
                                        <motion.div
                                            className={`h-full ${category.color.replace('text-', 'bg-')}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                                        />
                                    </div>

                                    {/* Description (Explicitly Visible) */}
                                    <div className="text-[9px] font-bold text-indigo-300 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {category.description}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Per Capita Impact */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-4 bg-red-950/20 border border-red-900/50 p-2 text-center"
                    >
                        <div className="text-[10px] text-zinc-500 font-mono uppercase mb-0.5">
                            Per Minnesota Taxpayer Impact
                        </div>
                        <div className="text-2xl font-bold text-neon-red font-mono">
                            ${Math.round(TOTAL_FRAUD / 4_500_000).toLocaleString()}
                        </div>
                        <div className="text-[9px] text-zinc-600 font-mono mt-0.5">
                            Based on 4.5M adult residents
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
}
