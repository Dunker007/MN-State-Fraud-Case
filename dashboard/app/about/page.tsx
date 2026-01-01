import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] font-mono p-8">
            <div className="max-w-2xl mx-auto space-y-12">
                <header>
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        RETURN_TO_DASHBOARD
                    </Link>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-4">
                        ABOUT
                        <span className="text-zinc-500 block text-lg font-normal mt-2 font-mono">
                            // MISSION_STATEMENT
                        </span>
                    </h1>
                </header>

                <section className="space-y-6 text-sm text-zinc-300 leading-relaxed">
                    <p>
                        This dashboard was built by a group of concerned citizens dedicated to transparency and accountability in Minnesota's public funding systems.
                    </p>
                    <p>
                        Following reports of widespread fraud in the DHS childcare assistance programs, we realized that the sheer volume of data made it difficult for the public—and even investigators—to see the "big picture." Individual revocations were happening in silos, while the networks behind them remained hidden.
                    </p>
                    <p>
                        <strong>Our Mission:</strong> To aggregate public records, secure court documents, and verified news reports into a single, searchable intelligence platform. We aim to empower investigative journalists, law enforcement, and taxpayers to trace the flow of public funds.
                    </p>
                </section>

                <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-lg text-center space-y-4">
                    <Shield className="w-12 h-12 text-zinc-600 mx-auto" />
                    <h2 className="text-xl font-bold text-white">Have Information?</h2>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        If you have tips, corrections, or additional documents regarding this investigation, please contact us securely.
                    </p>
                    <a href="mailto:tips@example.com" className="inline-block bg-white text-black px-6 py-2 rounded font-bold hover:bg-zinc-200 transition-colors">
                        SEND_TIP_ENCRYPTED
                    </a>
                </section>

                <footer className="text-[10px] text-zinc-600 border-t border-zinc-900 pt-8 mt-12">
                    <p>
                        This tool is not affiliated with the Minnesota Department of Human Services.
                    </p>
                </footer>
            </div>
        </div>
    );
}
