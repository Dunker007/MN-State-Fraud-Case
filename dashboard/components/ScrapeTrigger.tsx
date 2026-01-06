"use client";

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ScrapeTrigger() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const runScrape = async () => {
        setLoading(true);
        setMsg('');
        try {
            const res = await fetch('/api/paid-leave/scrape', {
                method: 'POST',
                body: JSON.stringify({ url: 'simulation-mode' })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setMsg('Success! New intelligence captured.');
                // Refresh page to show new data
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMsg(data.message || 'Scrape failed.');
            }
        } catch (e) {
            setMsg('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={runScrape}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-800 rounded text-xs text-red-300 transition-colors"
            >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'RUNNING INTELLIGENCE...' : 'TRIGGER LIVE SCRAPE (SIM)'}
            </button>
            {msg && <span className="text-xs text-zinc-400 animate-fade-in">{msg}</span>}
        </div>
    );
}
