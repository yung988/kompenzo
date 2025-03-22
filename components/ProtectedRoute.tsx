'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

// Komponenta pro ochranu cest
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Pokud načítání skončilo a uživatel není přihlášen, přesměruj na přihlášení
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Během načítání zobrazíme loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    );
  }

  // Pokud je uživatel přihlášen, zobrazíme obsah stránky
  return user ? <>{children}</> : null;
} 