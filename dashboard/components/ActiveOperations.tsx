"use client";

import { motion } from "framer-motion";
import { Radio, ShieldAlert, FileSearch, Banknote, Siren } from "lucide-react";

interface OperationEvent {
    id: string;
    time: string;
    type: "RAID" | "SEIZURE" | "SUBPOENA" | "INTEL";
    message: string;
    status: "active" | "completed" | "pending";
}

const EVENTS: OperationEvent[] = [
    {
        id: "1",
        time: "14:32",
        type: "RAID",
        message: "FBI Entry Team Active: 2 locations in Burnsville (HSS Provider)",
        status: "active"
    },
    {
        id: "2",
        time: "11:15",
        type: "SEIZURE",
        message: "$2.4M Assets Frozen: Personal accounts linked to Happy Hands Inc.",
        status: "completed"
    },
    {
        id: "3",
        time: "09:45",
        type: "SUBPOENA",
        message: "Grand Jury Subpoenas Served: 3 Daycare Centers in Hopkins",
        status: "completed"
    },
    {
        id: "4",
        time: "08:30",
        type: "INTEL",
        message: "DHS whistleblower submitted 400pg evidence file (EIDBI scheme)",
        status: "pending"
    }
];

export default function ActiveOperations() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 border border-zinc-800 rounded-lg p-4 h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Radio className="w-5 h-5 text-red-500" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <h3 className="text-sm font-bold text-white font-mono tracking-wider">
                        LIVE_WIRE // ACTIVE_OPERATIONS
                    </h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    LIVE FEED
                </div>
            </div>

            <div className="space-y-3">
                {EVENTS.map((event, i) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-start gap-3 p-2 rounded bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-colors group"
                    >
                        <div className="mt-0.5">
                            {event.type === "RAID" && <Siren className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                            {event.type === "SEIZURE" && <Banknote className="w-3.5 h-3.5 text-green-500" />}
                            {event.type === "SUBPOENA" && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                            {event.type === "INTEL" && <FileSearch className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className={`text-[10px] font-bold font-mono ${event.type === "RAID" ? "text-red-400" :
                                        event.type === "SEIZURE" ? "text-green-400" :
                                            event.type === "SUBPOENA" ? "text-amber-400" : "text-blue-400"
                                    }`}>
                                    {event.type}
                                </span>
                                <span className="text-[10px] text-zinc-600 font-mono">
                                    {event.time}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-300 font-mono leading-tight truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:relative group-hover:z-10 group-hover:bg-zinc-900 group-hover:p-1 group-hover:-m-1 group-hover:rounded group-hover:shadow-xl group-hover:border group-hover:border-zinc-700">
                                {event.message}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] text-zinc-600 font-mono">
                    System Resources: 8 Active Agents
                </div>
                <button className="text-[10px] text-red-400 hover:text-red-300 font-mono flex items-center gap-1">
                    VIEW ALL LOGS <Radio className="w-3 h-3" />
                </button>
            </div>
        </motion.section>
    );
}
