import { Suspense } from "react";
import DashboardClient from "@/components/DashboardClient";
import { CrosscheckHeader } from "@/components/CrosscheckHeader";

// Force dynamic rendering due to useSearchParams usage
export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-2 border-red-900/30 rounded-full animate-spin" />
          <div className="absolute inset-2 border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.75s' }} />
        </div>
        <p className="text-zinc-500 font-mono text-sm">LOADING_DASHBOARD...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <CrosscheckHeader />
      <Suspense fallback={<LoadingFallback />}>
        <DashboardClient />
      </Suspense>
    </>
  );
}
