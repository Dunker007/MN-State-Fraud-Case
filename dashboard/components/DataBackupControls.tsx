"use client";

import { useState, useRef } from "react";
import { Download, Upload, Save, RotateCcw, Check, AlertTriangle } from "lucide-react";

export default function DataBackupControls() {
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = () => {
        try {
            const data = {
                version: 1,
                timestamp: new Date().toISOString(),
                investigation_board: parseLocalStorage("investigation_board"),
                glass_house_notes: parseLocalStorage("glass_house_notes"),
                dossier_notes: parseLocalStorage("dossier_notes"),
                glass_house_favorites: parseLocalStorage("glass_house_favorites") // If used
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `glass_house_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);

            showStatus("success", "Backup downloaded successfully");
        } catch (e) {
            console.error(e);
            showStatus("error", "Failed to generate backup");
        }
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);

                // Simple validation
                if (!data.version || !data.timestamp) throw new Error("Invalid backup file format");

                if (confirm(`Restore data from ${new Date(data.timestamp).toLocaleDateString()}? This will overwrite current investigation data.`)) {
                    if (data.investigation_board) localStorage.setItem("investigation_board", JSON.stringify(data.investigation_board));
                    if (data.glass_house_notes) localStorage.setItem("glass_house_notes", JSON.stringify(data.glass_house_notes));
                    if (data.dossier_notes) localStorage.setItem("dossier_notes", JSON.stringify(data.dossier_notes));
                    if (data.glass_house_favorites) localStorage.setItem("glass_house_favorites", JSON.stringify(data.glass_house_favorites));

                    showStatus("success", "Data restored. Reloading...");
                    setTimeout(() => window.location.reload(), 1500);
                }
            } catch (err) {
                console.error(err);
                showStatus("error", "Invalid or corrupt backup file");
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = "";
    };

    const parseLocalStorage = (key: string) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    };

    const showStatus = (type: "success" | "error", msg: string) => {
        setStatus(type);
        setMessage(msg);
        setTimeout(() => {
            setStatus("idle");
            setMessage("");
        }, 3000);
    };

    return (
        <div className="space-y-4 p-4 border border-zinc-800 rounded-lg bg-black/40">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Save className="w-3 h-3" /> Data Persistence
            </h3>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleBackup}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded transition-colors"
                >
                    <Download className="w-3 h-3" />
                    Backup
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded transition-colors"
                >
                    <Upload className="w-3 h-3" />
                    Restore
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleRestore}
                className="hidden"
                accept=".json"
            />

            {status !== "idle" && (
                <div className={`text-[10px] p-2 rounded flex items-center gap-2 ${status === "success" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                    }`}>
                    {status === "success" ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {message}
                </div>
            )}
        </div>
    );
}
