'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamicky importujeme komponentu s useSearchParams, aby se nepoužila při
// statickém renderování stránky
const ClaimForm = dynamic(() => import('@/components/ClaimForm'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto px-4 py-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p>Načítání formuláře...</p>
    </div>
  )
})

export default function SubmitClaim() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Načítání stránky...</p>
      </div>
    }>
      <ClaimForm />
    </Suspense>
  )
}

