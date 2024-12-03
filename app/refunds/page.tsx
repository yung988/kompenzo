'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface Refund {
  id: string
  ticketId: string
  transportType: 'train' | 'bus'
  routeNumber: string
  departureDate: string
  delayMinutes: number
  status: 'pending' | 'approved' | 'rejected'
  amount: number
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([])

  useEffect(() => {
    const mockRefunds: Refund[] = [
      {
        id: '1',
        ticketId: '2',
        transportType: 'bus',
        routeNumber: 'B456',
        departureDate: '2023-06-15',
        delayMinutes: 75,
        status: 'approved',
        amount: 150
      },
      {
        id: '2',
        ticketId: '3',
        transportType: 'train',
        routeNumber: 'R789',
        departureDate: '2023-06-20',
        delayMinutes: 90,
        status: 'pending',
        amount: 200
      }
    ]
    setRefunds(mockRefunds)
  }, [])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Schváleno' }
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Zamítnuto' }
      default:
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Zpracovává se' }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Moje refundace</h1>
      {refunds.map((refund) => {
        const statusInfo = getStatusInfo(refund.status)
        return (
          <Card key={refund.id} className="mb-4 glass-effect overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-blue-800">
                    {refund.transportType === 'train' ? 'Vlak' : 'Autobus'} {refund.routeNumber}
                  </h3>
                  <p className="text-gray-600">{refund.departureDate}</p>
                </div>
                <Badge className={`${statusInfo.color} flex items-center`}>
                  <statusInfo.icon className="mr-1 h-4 w-4" />
                  {statusInfo.text}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <p>Zpoždění: {refund.delayMinutes} minut</p>
                <p className="font-semibold">Částka refundace: {refund.amount} Kč</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

