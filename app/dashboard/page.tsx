'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBetterAuth } from '@/lib/better-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useBetterAuth()

  // Přesměrování, pokud není uživatel přihlášen
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="container py-8 mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-md w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded-md"></div>
            <div className="h-32 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        Vítejte, {user?.name || 'uživateli'}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vaše jízdenky</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Nahrajte své jízdenky pro případné refundace.</p>
            <Button asChild className="w-full">
              <Link href="/tickets">Spravovat jízdenky</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Žádosti o refundace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Sledujte stav vašich žádostí o odškodnění.</p>
            <Button asChild className="w-full">
              <Link href="/refunds">Moje refundace</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skenovat jízdenku</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Rychle naskenujte jízdenku pomocí fotoaparátu.</p>
            <Button asChild className="w-full">
              <Link href="/scan-ticket">Naskenovat jízdenku</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Váš profil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Upravte své osobní údaje a nastavení účtu.</p>
            <Button asChild className="w-full">
              <Link href="/profile">Upravit profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

