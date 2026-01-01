
export default function LegalDisclaimer() {
    return (
        <div className="bg-black border-t border-zinc-900 py-6 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <p className="text-[10px] text-zinc-600 font-mono leading-relaxed max-w-2xl mx-auto">
                    <span className="font-bold text-zinc-500">DISCLAIMER:</span> All data presented in this dashboard is sourced directly from publicly available <span className="text-zinc-500">Minnesota Department of Human Services (DHS)</span> records and court filings as of Dec 30, 2025.
                    This tool presents factual information from government sources for educational and journalistic purposes.
                    No claims of criminal wrongdoing are made by the creators of this dashboard without supporting indictments or official revocations.
                    Risk scores are algorithmic derived metrics based on red flags and do not constitute legal judgments.
                </p>
            </div>
        </div>
    );
}
