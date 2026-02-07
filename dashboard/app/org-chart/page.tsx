
import { Suspense } from 'react';
import ConspiracyGraph from '@/components/ConspiracyGraph';

export const dynamic = 'force-dynamic';

export default function OrgChartPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
            <div className="max-w-[1800px] mx-auto h-full flex flex-col">

                <header className="mb-8 border-b border-zinc-800 pb-6">
                    <h1 className="text-4xl font-light tracking-tight text-white uppercase">
                        Structural <span className="font-bold text-blue-500">Blueprint</span>
                    </h1>
                    <p className="text-zinc-400 mt-2 max-w-3xl">
                        Hierarchical analysis of the Minnesota Department of Human Services (DHS) and the oversight failures that enabled the diversion network.
                    </p>
                </header>

                <div className="flex-1 bg-black rounded-lg border border-zinc-800 relative overflow-hidden h-[800px]">
                    <ConspiracyGraph className="h-full w-full" />
                </div>

            </div>
        </div>
    );
}
