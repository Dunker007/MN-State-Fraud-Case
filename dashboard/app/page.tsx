import { Suspense } from 'react';
import { CrosscheckHeader } from '@/components/CrosscheckHeader';
import DashboardClient from '@/components/DashboardClient';
import DesktopSidebar from '@/components/DesktopSidebar';

// Force dynamic rendering due to useSearchParams usage
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <DesktopSidebar />
      <div className="lg:hidden">
        <CrosscheckHeader />
      </div>
      <Suspense fallback={<div className="text-white text-center pt-20">Initializing System...</div>}>
        <DashboardClient />
      </Suspense>
    </main>
  );
}
