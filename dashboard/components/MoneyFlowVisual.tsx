"use client";

import React from "react";
import { motion } from "framer-motion";
import { Banknote, ArrowRightFromLine, Siren } from "lucide-react";

const MoneyFlowVisual = () => {
    return (
        <div className="w-full p-6 bg-slate-950 border border-blue-900/50 rounded-xl relative overflow-hidden">
            {/* Background Grid & Glitch Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 animate-pulse" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 py-12">
                {/* ORIGIN: MINNESOTA DHS */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        {/* Stylized MN Outline SVG */}
                        <svg width="120" height="140" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <path d="M10 5H90V30L95 35V110H60L55 115H5V35L10 30V5Z" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />
                            <path d="M15 10H85V32L15 32V10Z" fill="#1e3a8a" fillOpacity="0.5" />
                        </svg>
                        <div className="absolute -top-2 -right-2 bg-red-600 text-xs font-bold px-2 py-1 rounded-sm border border-red-400 animate-pulse">
                            BREACHED
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-blue-400 tracking-wider">MN DHS</h3>
                        <p className="text-sm text-blue-200/70">Source of Funds</p>
                    </div>
                </div>

                {/* THE FLOW: ANIMATED CASH */}
                <div className="flex-1 relative h-24 flex items-center justify-center px-4">
                    {/* The Path Line */}
                    <div className="absolute h-1 w-full bg-gradient-to-r from-blue-600 via-green-500 to-orange-600 opacity-30"></div>

                    {/* Animated Money Particles */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            initial={{ x: "-150%", opacity: 0, scale: 0.5 }}
                            animate={{
                                x: ["-150%", "150%"],
                                opacity: [0, 1, 1, 0],
                                scale: [0.5, 1, 1, 0.5]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: "linear",
                                delay: i * 0.6, // Stagger the flow
                            }}
                        >
                            <Banknote className="w-8 h-8 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
                        </motion.div>
                    ))}

                    {/* THE $9 BILLION LABEL */}
                    <div className="absolute -top-12 bg-slate-900/80 border border-green-500/50 backdrop-blur-md px-4 py-2 rounded-md text-center z-20">
                        <span className="block text-2xl font-black text-green-400 drop-shadow-sm">$9 BILLION</span>
                        <span className="text-xs text-green-200/70 uppercase tracking-widest">Estimated Diversion</span>
                    </div>
                </div>

                {/* DESTINATION: SOMALIA / HORN OF AFRICA */}
                <div className="flex flex-col items-center space-y-4 relative">
                    {/* Terror Nexus Warning */}
                    <div className="absolute -top-16 right-0 flex items-center gap-2 bg-red-950/90 border border-red-600 text-red-100 px-3 py-1 rounded animate-pulse z-30">
                        <Siren className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold tracking-wider">TERROR NEXUS CONFIRMED</span>
                    </div>

                    <div className="relative">
                        {/* Stylized Horn of Africa Outline SVG */}
                        <svg width="140" height="140" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                            <path d="M10 10C30 15 60 5 90 20C110 35 115 70 100 100C80 110 40 105 20 90C5 70 0 30 10 10Z" stroke="#f97316" strokeWidth="2" />
                            {/* Impact Point */}
                            <circle cx="80" cy="40" r="10" fill="#f97316" fillOpacity="0.3" className="animate-ping" />
                        </svg>
                        <div className="absolute bottom-4 right-4">
                            <ArrowRightFromLine className="w-6 h-6 text-orange-500 rotate-[-45deg]" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-orange-400 tracking-wider">HORN OF AFRICA</h3>
                        <p className="text-sm text-orange-200/70">Destination / Al-Shabaab</p>
                    </div>
                </div>
            </div>

            {/* Footer Citation */}
            <div className="absolute bottom-2 right-4 text-[10px] text-slate-500">
                Source: Federal Prosecutors / The Hill / AP (Dec 30, 2025)
            </div>
        </div>
    );
};

export default MoneyFlowVisual;
