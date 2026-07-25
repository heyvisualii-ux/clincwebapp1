'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PatientSidebar } from '@/components/layout/patient-sidebar';
import { Loader2 } from 'lucide-react';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && role === 'admin') {
      router.push('/admin');
    }
  }, [loading, user, role, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <PatientSidebar />
      <div className="flex-1 min-w-0">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
