"use client";

import { motion } from 'framer-motion';
import { Building, Plane, Gem, ShoppingBag, Palmtree } from 'lucide-react';

export default function SpendingArtifacts() {
    const items = [
        {
            icon: Building,
            label: 'NAIROBI COMPLEX',
            sub: '12-Story Apartment Bldg',
            cost: 'EST. $4.2M'
        },
        {
            icon: Palmtree,
            label: 'LUXURY REAL ESTATE',
            sub: 'Vacation Homes (Turkey)',
            cost: 'MULTIPLE'
        },
        {
            icon: Plane,
            label: 'INTL. TRAVEL',
            sub: 'First Class / Chartered',
            cost: 'FREQUENT'
        },
        {
            icon: Gem,
            label: 'GOLD EXPORT',
            sub: 'Jewelry Smuggling',
            cost: 'HIGH VOLUME'
        },
        {
            icon: ShoppingBag,
            label: 'LUXURY GOODS',
            sub: 'Designer Vehicles/Clothing',
            cost: 'V. HIGH'
        },
        {
            icon: Building,
            label: 'COMMERCIAL REAL ESTATE',
            sub: 'Office Parks / Warehouses',
            cost: 'MULTIPLE'
        },
        {
            icon: Palmtree,
            label: 'OFFSHORE HOLDINGS',
            sub: 'Dubai / Istanbul / Nairobi',
            cost: 'UNKNOWN'
        }
    ];

    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 border border-zinc-800 rounded-lg p-3 h-full flex flex-col min-h-[350px]"
        >
            <h3 className="text-[10px] font-bold text-zinc-500 font-mono mb-3 uppercase tracking-wider border-b border-zinc-800 pb-2">
                VERIFIED ASSET TRACING
            </h3>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {items.map((item, i) => (
                    <div key={i} className="group">
                        <div className="flex items-start gap-2 p-1.5 rounded hover:bg-zinc-900/50 transition-colors">
                            <div className="p-1.5 bg-zinc-900 rounded text-zinc-400 group-hover:text-neon-blue group-hover:bg-blue-950/20 transition-colors">
                                <item.icon className="w-3 h-3" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-zinc-300 group-hover:text-white font-mono leading-tight">
                                    {item.label}
                                </div>
                                <div className="text-[9px] text-zinc-500 font-mono">
                                    {item.sub}
                                </div>
                                <div className="text-[9px] text-emerald-500/80 font-mono mt-0.5">
                                    {item.cost}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800">
                <div className="text-[9px] text-zinc-600 font-mono text-center">
                    SOURCE: FBI / IRS SEIZURE LOGS
                </div>
            </div>
        </motion.section>
    );
}
