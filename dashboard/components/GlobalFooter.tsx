import { ExternalLink, Github, Database, Scale, FileText } from 'lucide-react';

export default function GlobalFooter() {
    return (
        <footer className="w-full bg-black border-t border-zinc-900 py-8 px-4 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 font-mono text-[10px] md:text-xs">

                {/* Left: Branding & Status */}
                <div className="flex flex-col gap-2 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="font-bold text-zinc-400 tracking-wider">PROJECT CROSSCHECK</span>
                        <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-[2px]">v2.1</span>
                    </div>
                    <p>Forensic Audit • MN-DHS Case #2025-X9</p>
                    <p className="opacity-50">Built by Alex Vance for the people of Minnesota.</p>
                </div>

                {/* Center: Data Sources */}
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <a href="https://mn.gov/deed/programs-services/paid-family-medical-leave/" target="_blank" rel="noopener" className="hover:text-zinc-300 transition-colors flex items-center gap-1 group">
                        <Database className="w-3 h-3 group-hover:text-blue-500" /> DEED
                    </a>
                    <a href="https://www.revisor.mn.gov/statutes/" target="_blank" rel="noopener" className="hover:text-zinc-300 transition-colors flex items-center gap-1 group">
                        <Scale className="w-3 h-3 group-hover:text-purple-500" /> MN Revisor
                    </a>
                    <a href="https://www.mncourts.gov/" target="_blank" rel="noopener" className="hover:text-zinc-300 transition-colors flex items-center gap-1 group">
                        <FileText className="w-3 h-3 group-hover:text-red-500" /> MNCIS
                    </a>
                    <a href="https://www.gdeltproject.org/" target="_blank" rel="noopener" className="hover:text-zinc-300 transition-colors flex items-center gap-1 group">
                        <ExternalLink className="w-3 h-3 group-hover:text-emerald-500" /> GDELT 2.0
                    </a>
                </div>

                {/* Right: GitHub & Last Scan */}
                <div className="flex flex-col gap-2 text-center md:text-right">
                    <a href="https://github.com/Dunker007/MN-State-Fraud-Case" target="_blank" rel="noopener" className="flex items-center justify-center md:justify-end gap-2 hover:text-white transition-colors">
                        <Github className="w-4 h-4" />
                        <span>Source Code</span>
                    </a>
                    <div>
                        <span className="text-zinc-500">Last System Scan: </span>
                        <span className="text-emerald-500 animate-pulse font-bold">LIVE</span>
                    </div>
                </div>

            </div>
        </footer>
    );
}
