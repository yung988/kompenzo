'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface Ticket {
  id: string
  type: 'digital' | 'scanned'
  transportType: 'train' | 'bus'
  routeNumber: string
  departureDate: string
  departureTime: string
  arrivalDate: string
  arrivalTime: string
  status: 'active' | 'used' | 'expired'
  delayMinutes: number
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: '1',
        type: 'digital',
        transportType: 'train',
        routeNumber: 'R123',
        departureDate: '2023-06-10',
        departureTime: '14:30',
        arrivalDate: '2023-06-10',
        arrivalTime: '16:45',
        status: 'active',
        delayMinutes: 0
      },
      {
        id: '2',
        type: 'scanned',
        transportType: 'bus',
        routeNumber: 'B456',
        departureDate: '2023-06-15',
        departureTime: '09:00',
        arrivalDate: '2023-06-15',
        arrivalTime: '11:30',
        status: 'used',
        delayMinutes: 75
      }
    ]
    setTickets(mockTickets)
  }, [])

  const renderTicket = (ticket: Ticket) => (
    <Card key={ticket.id} className="mb-4 glass-effect overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-blue-800">
              {ticket.transportType === 'train' ? 'Vlak' : 'Autobus'} {ticket.routeNumber}
            </h3>
            <p className="text-gray-600">{ticket.departureDate}</p>
          </div>
          {ticket.status === 'active' ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Aktivní</span>
          ) : ticket.status === 'used' ? (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Použitá</span>
          ) : (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Expirovaná</span>
          )}
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <div>
            <p>Odjezd: {ticket.departureTime}</p>
            <p>Příjezd: {ticket.arrivalTime}</p>
          </div>
        </div>
        {ticket.delayMinutes > 0 && (
          <div className="flex items-center text-red-500 mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>Zpoždění: {ticket.delayMinutes} minut</p>
          </div>
        )}
        {ticket.delayMinutes >= 60 && ticket.status === 'used' && (
          <Button className="w-full">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Požádat o refundaci
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Moje jízdenky</h1>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">Všechny</TabsTrigger>
          <TabsTrigger value="digital">Digitální</TabsTrigger>
          <TabsTrigger value="scanned">Naskenované</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {tickets.map(renderTicket)}
        </TabsContent>
        <TabsContent value="digital">
          {tickets.filter(t => t.type === 'digital').map(renderTicket)}
        </TabsContent>
        <TabsContent value="scanned">
          {tickets.filter(t => t.type === 'scanned').map(renderTicket)}
        </TabsContent>
      </Tabs>
    </div>
  )
}

