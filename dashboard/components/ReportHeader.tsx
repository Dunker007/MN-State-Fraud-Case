export default function ReportHeader() {
    return (
        <div className="hidden print:block mb-8 border-b-2 border-zinc-300 pb-4">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase tracking-tighter mb-1">
                        Paid Leave Watch
                    </h1>
                    <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest">
                        System Intelligence Report
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Generated Snapshot</p>
                    <p className="font-mono text-sm font-bold text-black">
                        {new Date().toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        })}
                    </p>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider">
                    CONFIDENTIAL - FOR INTERNAL USE ONLY
                </p>
                <p className="text-[9px] text-zinc-400 font-mono">
                    MN.GOV // FRAUD DETECTION UNIT
                </p>
            </div>
        </div>
    );
}
