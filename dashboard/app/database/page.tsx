import MasterlistGrid from "@/components/MasterlistGrid";

export default function DatabasePage() {
    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">FULL DATABASE</h1>
                    <p className="text-zinc-400 max-w-2xl">
                        Complete raw intelligence from MN DHS Licensing Lookup.
                        Includes 19,000+ providers, enriched with scraped owner data and forensic Ghost Office detection.
                    </p>
                </div>

                <MasterlistGrid />
            </div>
        </div>
    );
}
