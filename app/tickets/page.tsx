'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBetterAuth } from '@/lib/better-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, X, Clock, AlertCircle } from 'lucide-react'
import { ticketService } from '@/lib/api-supabase'
import { calculateRefund } from '@/lib/api-supabase'
import { Ticket } from '@/lib/types'

export default function TicketsPage() {
  const { user, isLoading: authLoading } = useBetterAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    const loadTickets = async () => {
      setIsLoading(true)
      try {
        if (user?.id) {
          const userTickets = await ticketService.getTicketsForUser(user.id)
          setTickets(userTickets || [])
        }
      } catch (err) {
        console.error('Chyba při načítání jízdenek:', err)
        setError('Nepodařilo se načíst jízdenky. Zkuste to prosím znovu.')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      loadTickets()
    }
  }, [authLoading, user, router])

  const handleAddTicket = () => {
    router.push('/tickets/add')
  }
  
  const handleClaimRefund = (ticketId: string) => {
    router.push(`/submit-claim?ticketId=${ticketId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktivní</Badge>
      case 'used':
        return <Badge className="bg-gray-500">Použitá</Badge>
      case 'expired':
        return <Badge className="bg-red-500">Propadlá</Badge>
      default:
        return <Badge>Neznámý</Badge>
    }
  }

  const getCarrierName = (carrier: string) => {
    switch (carrier) {
      case 'cd':
        return 'České dráhy'
      case 'cd_eticket':
        return 'České dráhy (eTiket)'
      case 'regiojet':
        return 'RegioJet'
      case 'flixbus':
        return 'FlixBus'
      default:
        return carrier
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Načítání jízdenek...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
        <Button onClick={() => window.location.reload()}>Zkusit znovu</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Moje jízdenky</h1>
        <Button onClick={handleAddTicket}>Přidat jízdenku</Button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Zatím nemáte žádné jízdenky</h2>
          <p className="text-gray-600 mb-4">
            Přidejte svou první jízdenku a získejte možnost automatického odškodnění
          </p>
          <Button onClick={handleAddTicket}>Přidat jízdenku</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            const refundAmount = calculateRefund(ticket)
            const canClaimRefund = ticket.delayMinutes >= 60 && refundAmount > 0
            
            return (
              <Card key={ticket.id} className="overflow-hidden">
                <CardHeader className="bg-blue-50 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {ticket.transportType === 'train' ? 'Vlak' : 'Autobus'} {ticket.routeNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{getCarrierName(ticket.carrier)}</p>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Odkud</p>
                        <p className="font-medium">{ticket.departureStation}</p>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-xs text-gray-500">Kam</p>
                        <p className="font-medium">{ticket.arrivalStation}</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Datum</p>
                        <p className="font-medium">{ticket.departureDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Zpoždění</p>
                        <p className={`font-medium ${ticket.delayMinutes >= 60 ? 'text-red-600' : ''}`}>
                          {ticket.delayMinutes} min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cena</p>
                        <p className="font-medium">{ticket.price} Kč</p>
                      </div>
                    </div>

                    {ticket.delayMinutes > 0 && (
                      <div className={`mt-2 p-2 rounded ${canClaimRefund ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className="flex items-center">
                          {canClaimRefund ? (
                            <Check className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <X className="h-4 w-4 text-red-600 mr-2" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {canClaimRefund 
                                ? `Nárok na odškodnění: ${refundAmount} Kč` 
                                : 'Nesplňuje podmínky pro odškodnění'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {canClaimRefund 
                                ? `${Math.round((refundAmount / ticket.price) * 100)}% z ceny jízdenky` 
                                : ticket.delayMinutes < 60 
                                  ? 'Zpoždění musí být alespoň 60 minut' 
                                  : 'Nesplňuje podmínky pro minimální cenu'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 bg-gray-50 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                    className="flex-1"
                  >
                    Detail
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleClaimRefund(ticket.id)}
                    disabled={!canClaimRefund}
                    className={`flex-1 ${canClaimRefund ? '' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    Žádat o odškodnění
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

