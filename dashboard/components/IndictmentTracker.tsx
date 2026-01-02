"use client";

import { motion } from 'framer-motion';
import {
    Gavel,
    Shield,
    CheckCircle,
    XCircle,
    Scale,
    Skull
} from 'lucide-react';
import { useState } from 'react';

interface Defendant {
    id: string;
    name: string;
    role: string;
    scheme: string;
    status: 'convicted' | 'indicted' | 'at_large' | 'cooperating' | 'acquitted';
    charges: string[];
    amount: number;
    sentence?: string;
    notes?: string;
}

const defendants: Defendant[] = [
    {
        id: '1',
        name: 'Aimee Bock',
        role: 'Founder, Feeding Our Future',
        scheme: 'FOF',
        status: 'convicted',
        charges: ['Wire Fraud', 'Money Laundering', 'Bribery'],
        amount: 250_000_000,
        sentence: 'Pending (Convicted Dec 2024)',
        notes: 'Mastermind of largest pandemic fraud scheme'
    },
    {
        id: '2',
        name: 'Abdiaziz Farah',
        role: 'Owner, Empire Cuisine',
        scheme: 'FOF',
        status: 'convicted',
        charges: ['Wire Fraud', 'Money Laundering'],
        amount: 40_000_000,
        sentence: 'Pending sentencing'
    },
    {
        id: '3',
        name: 'Mohamed Jama',
        role: 'Site Operator',
        scheme: 'FOF',
        status: 'convicted',
        charges: ['Wire Fraud', 'Conspiracy'],
        amount: 15_000_000,
        sentence: '60 months'
    },
    {
        id: '4',
        name: 'Abdimajid Nur',
        role: 'Ring Leader',
        scheme: 'FOF',
        status: 'at_large',
        charges: ['Wire Fraud', 'Money Laundering', 'Flight from Justice'],
        amount: 28_000_000,
        notes: 'FLED THE COUNTRY - Believed in Kenya'
    },
    {
        id: '5',
        name: 'Hadith Yusuf',
        role: 'Site Coordinator',
        scheme: 'FOF',
        status: 'indicted',
        charges: ['Wire Fraud', 'False Claims'],
        amount: 8_500_000
    },
    {
        id: '6',
        name: 'Salim Said',
        role: 'Operator',
        scheme: 'FOF',
        status: 'acquitted',
        charges: ['Wire Fraud'],
        amount: 0,
        notes: 'Acquitted by Judge Wilhelmina Wright (overturned jury)'
    },
    {
        id: '7',
        name: 'Multiple Daycare Operators',
        role: 'Various',
        scheme: 'CCAP',
        status: 'indicted',
        charges: ['CCAP Fraud', 'False Claims', 'Wire Fraud'],
        amount: 1_800_000_000,
        notes: 'HSI Raids Dec 30, 2025 - 12+ locations'
    },
];

const statusConfig = {
    convicted: {
        label: 'CONVICTED',
        color: 'text-green-500',
        bg: 'bg-green-950/30',
        border: 'border-green-900',
        icon: CheckCircle,
    },
    indicted: {
        label: 'INDICTED',
        color: 'text-amber-500',
        bg: 'bg-amber-950/30',
        border: 'border-amber-900',
        icon: Scale,
    },
    at_large: {
        label: 'AT LARGE',
        color: 'text-neon-red',
        bg: 'bg-red-950/30',
        border: 'border-red-900',
        icon: Skull,
    },
    cooperating: {
        label: 'COOPERATING',
        color: 'text-blue-500',
        bg: 'bg-blue-950/30',
        border: 'border-blue-900',
        icon: Shield,
    },
    acquitted: {
        label: 'ACQUITTED',
        color: 'text-zinc-500',
        bg: 'bg-zinc-900/50',
        border: 'border-zinc-700',
        icon: XCircle,
    },
};

export default function IndictmentTracker() {
    const [filter, setFilter] = useState<string>('all');

    const stats = {
        total: defendants.length,
        convicted: defendants.filter(d => d.status === 'convicted').length,
        indicted: defendants.filter(d => d.status === 'indicted').length,
        atLarge: defendants.filter(d => d.status === 'at_large').length,
        acquitted: defendants.filter(d => d.status === 'acquitted').length,
    };

    const filteredDefendants = filter === 'all'
        ? defendants
        : defendants.filter(d => d.status === filter);

    const totalRecovered = defendants
        .filter(d => d.status === 'convicted')
        .reduce((sum, d) => sum + d.amount, 0);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Gavel className="w-6 h-6 text-amber-500" />
                <div>
                    <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
                        FEDERAL_INDICTMENT_TRACKER
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        District of Minnesota | DOJ Fraud Section | Active Cases
                    </p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-5 gap-4 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`bg-zinc-900/50 border p-3 transition-all ${filter === 'all' ? 'border-white' : 'border-zinc-800 hover:border-zinc-600'}`}
                >
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Total Cases</div>
                    <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
                </button>
                <button
                    onClick={() => setFilter('convicted')}
                    className={`bg-zinc-900/50 border p-3 transition-all ${filter === 'convicted' ? 'border-green-500' : 'border-zinc-800 hover:border-zinc-600'}`}
                >
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Convicted</div>
                    <div className="text-2xl font-bold text-green-500 font-mono">{stats.convicted}</div>
                </button>
                <button
                    onClick={() => setFilter('indicted')}
                    className={`bg-zinc-900/50 border p-3 transition-all ${filter === 'indicted' ? 'border-amber-500' : 'border-zinc-800 hover:border-zinc-600'}`}
                >
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Indicted</div>
                    <div className="text-2xl font-bold text-amber-500 font-mono">{stats.indicted}</div>
                </button>
                <button
                    onClick={() => setFilter('at_large')}
                    className={`bg-zinc-900/50 border p-3 transition-all ${filter === 'at_large' ? 'border-red-500' : 'border-zinc-800 hover:border-zinc-600'}`}
                >
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">At Large</div>
                    <div className="text-2xl font-bold text-neon-red font-mono animate-pulse">{stats.atLarge}</div>
                </button>
                <button
                    onClick={() => setFilter('acquitted')}
                    className={`bg-zinc-900/50 border p-3 transition-all ${filter === 'acquitted' ? 'border-zinc-500' : 'border-zinc-800 hover:border-zinc-600'}`}
                >
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Acquitted</div>
                    <div className="text-2xl font-bold text-zinc-500 font-mono">{stats.acquitted}</div>
                </button>
            </div>

            {/* Defendant Cards */}
            <div className="bg-black border border-zinc-800 p-4">
                <div className="space-y-4">
                    {filteredDefendants.map((defendant, index) => {
                        const config = statusConfig[defendant.status];
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={defendant.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`${config.bg} border ${config.border} p-4 rounded relative overflow-hidden`}
                            >
                                {/* Status Badge */}
                                <div className={`absolute top-0 right-0 ${config.bg} ${config.color} text-[10px] font-mono font-bold px-3 py-1 flex items-center gap-1`}>
                                    <Icon className="w-3 h-3" />
                                    {config.label}
                                </div>

                                {/* Fugitive Banner */}
                                {defendant.status === 'at_large' && (
                                    <div className="absolute top-0 left-0 bg-neon-red text-white text-[10px] font-mono font-bold px-3 py-1 animate-pulse">
                                        🚨 FUGITIVE
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white">{defendant.name}</h3>
                                        <p className="text-xs text-zinc-400 font-mono">{defendant.role}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {defendant.charges.map((charge, i) => (
                                                <span key={i} className="text-[10px] bg-black/50 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                                                    {charge}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs text-zinc-500 font-mono">Alleged Fraud</div>
                                        <div className={`text-xl font-bold font-mono ${defendant.amount > 0 ? config.color : 'text-zinc-600'}`}>
                                            ${(defendant.amount / 1_000_000).toFixed(1)}M
                                        </div>
                                        {defendant.sentence && (
                                            <div className="text-[10px] text-zinc-600 font-mono mt-1">
                                                {defendant.sentence}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {defendant.notes && (
                                    <div className="mt-3 text-xs text-zinc-500 bg-black/30 p-2 rounded border-l-2 border-zinc-700">
                                        {defendant.notes}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between text-xs font-mono text-zinc-500">
                    <span>
                        Conviction Rate: {((stats.convicted / (stats.total - stats.acquitted)) * 100).toFixed(0)}%
                    </span>
                    <span className="text-green-500">
                        Fraud Convicted: ${(totalRecovered / 1_000_000_000).toFixed(2)}B
                    </span>
                </div>
            </div>
        </motion.section>
    );
}
