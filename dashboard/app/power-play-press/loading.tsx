
import { CrosscheckHeader } from '@/components/CrosscheckHeader';
import PowerPlayNavigation from '@/components/PowerPlayNavigation';

export default function Loading() {
    return (
        <main className="min-h-screen bg-[#050505] text-[#ededed] font-mono">
            <CrosscheckHeader />
            <PowerPlayNavigation />

            <div className="w-full max-w-[95%] mx-auto px-4 py-12">
                <div className="mb-16">
                    <div className="h-16 bg-zinc-900 rounded w-2/3 animate-pulse mb-4" />
                    <div className="h-6 bg-zinc-900 rounded w-1/3 animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Featured Skeleton */}
                    <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 h-[500px] bg-zinc-900/30 border border-zinc-800 rounded animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-zinc-800/20" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                            <div className="h-4 bg-zinc-800 rounded w-32" />
                            <div className="h-12 bg-zinc-800 rounded w-full" />
                            <div className="h-12 bg-zinc-800 rounded w-2/3" />
                            <div className="h-4 bg-zinc-800 rounded w-full" />
                        </div>
                    </div>

                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-[420px] bg-zinc-900/30 border border-zinc-800 rounded animate-pulse flex flex-col">
                            {/* Image Skeleton */}
                            <div className="h-48 w-full bg-zinc-800/50" />

                            <div className="p-5 flex flex-col flex-1 justify-between">
                                <div className="w-full">
                                    <div className="h-3 bg-zinc-800 rounded w-20 mb-2" />
                                    <div className="h-2 bg-zinc-800 rounded w-32" />
                                </div>
                                <div className="my-4">
                                    <div className="h-6 bg-zinc-800 rounded w-full mb-2" />
                                    <div className="h-6 bg-zinc-800 rounded w-3/4 mb-4" />
                                    <div className="h-2 bg-zinc-800 rounded w-full mb-2" />
                                    <div className="h-2 bg-zinc-800 rounded w-2/3" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-4 bg-zinc-800 rounded w-16" />
                                    <div className="h-4 bg-zinc-800 rounded w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
