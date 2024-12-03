'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketPreview } from '@/components/ticket-preview'

interface Claim {
  id: number
  name: string
  transportType: string
  routeNumber: string
  departureDate: string
  delayMinutes: number
  status: string
  ticketScan: string
}

export default function Dashboard() {
  const [claims, setClaims] = useState<Claim[]>([])

  useEffect(() => {
    // In a real application, you would fetch this data from your backend
    const mockClaims: Claim[] = [
      {
        id: 1,
        name: 'Jan Novák',
        transportType: 'train',
        routeNumber: 'R123',
        departureDate: '2023-06-01',
        delayMinutes: 75,
        status: 'Zpracovává se',
        ticketScan: '/placeholder.svg?height=200&width=400',
      },
      {
        id: 2,
        name: 'Eva Svobodová',
        transportType: 'bus',
        routeNumber: 'B456',
        departureDate: '2023-06-02',
        delayMinutes: 90,
        status: 'Schváleno',
        ticketScan: '/placeholder.svg?height=200&width=400',
      },
    ]
    setClaims(mockClaims)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Moje žádosti o refundaci</h1>
      <div className="grid gap-4">
        {claims.map((claim) => (
          <Card key={claim.id}>
            <CardHeader>
              <CardTitle>{claim.transportType === 'train' ? 'Vlak' : 'Autobus'} {claim.routeNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Datum odjezdu: {claim.departureDate}</p>
              <p>Zpoždění: {claim.delayMinutes} minut</p>
              <p>Stav: {claim.status}</p>
              <TicketPreview imageUrl={claim.ticketScan} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

