'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, ExternalLink, ReceiptText } from 'lucide-react'
import { claimService, ticketService } from '@/lib/api-supabase'
import { RefundClaim, Ticket, RefundStatus } from '@/lib/types'

export default function RefundsPage() {
  const { isAuthenticated, currentUser } = useAuth()
  const router = useRouter()
  const [claims, setClaims] = useState<RefundClaim[]>([])
  const [ticketMap, setTicketMap] = useState<Record<string, Ticket>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const loadRefunds = async () => {
      setIsLoading(true)
      
      try {
        if (!currentUser?.id) return
        
        // Načtení všech žádostí
        const userClaims = await claimService.getClaimsForUser(currentUser.id)
        setClaims(userClaims)
        
        // Načtení souvisejících jízdenek
        const loadTicketDetails = async () => {
          const ticketPromises = claims.map(async (claim) => {
            if (!claim.ticket && claim.ticketId) {
              const ticket = await ticketService.getTicketById(claim.ticketId);
              return ticket;
            }
            return null;
          });
          
          const tickets = await Promise.all(ticketPromises);
          const ticketsById: Record<string, Ticket> = {};
          tickets.forEach(ticket => {
            if (ticket) {
              ticketsById[ticket.id] = ticket;
            }
          });
          setTicketMap(ticketsById);
        }

        await loadTicketDetails();
      } catch (err) {
        console.error('Chyba při načítání žádostí o refundaci:', err)
        setError('Nepodařilo se načíst žádosti. Zkuste to prosím znovu.')
      } finally {
        setIsLoading(false)
      }
    }

    loadRefunds()
  }, [isAuthenticated, currentUser, router, claims])
  
  const getStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Čeká na vyřízení</Badge>
      case 'approved':
        return <Badge className="bg-green-500">Schváleno</Badge>
      case 'rejected':
        return <Badge className="bg-red-500">Zamítnuto</Badge>
      case 'paid':
        return <Badge className="bg-blue-500">Vyplaceno</Badge>
      default:
        return <Badge>Neznámý stav</Badge>
    }
  }
  
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
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
        <span className="ml-2">Načítání žádostí...</span>
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
        <h1 className="text-3xl font-bold text-blue-800">Moje žádosti o odškodnění</h1>
        <Button onClick={() => router.push('/tickets')}>
          Podat novou žádost
        </Button>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ReceiptText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Zatím nemáte žádné žádosti o odškodnění</h2>
          <p className="text-gray-600 mb-4">
            Vyberte jízdenku se zpožděním a podejte žádost o odškodnění
          </p>
          <Button onClick={() => router.push('/tickets')}>Přejít na jízdenky</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {claims.map((claim) => {
            const ticket = ticketMap[claim.ticketId]
            
        return (
              <Card key={claim.id} className="overflow-hidden">
                <CardHeader className={`pb-2 ${
                  claim.status === 'approved' || claim.status === 'paid'
                    ? 'bg-green-50'
                    : claim.status === 'rejected'
                    ? 'bg-red-50'
                    : 'bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Žádost o odškodnění
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {formatDate(claim.submissionDate)}
                      </p>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Dopravce</p>
                      <p className="font-medium">{getCarrierName(claim.carrier)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Číslo žádosti</p>
                        <p className="font-medium">{claim.id.substring(0, 8).toUpperCase()}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Částka odškodnění</p>
                        <p className="font-bold text-lg">{claim.amount} Kč</p>
                      </div>
                    </div>
                    
                    {ticket && (
                      <div className="border-t pt-2 mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-semibold">Údaje o jízdence</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => router.push(`/tickets/${ticket.id}`)}
                            className="h-7 px-2 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Detail
                          </Button>
                        </div>
                        
                        <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                          <div>
                            <p className="text-gray-500">Spoj:</p>
                            <p>{ticket.transportType === 'train' ? 'Vlak' : 'Autobus'} {ticket.routeNumber}</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-500">Datum jízdy:</p>
                            <p>{ticket.departureDate}</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-500">Trasa:</p>
                            <p>{ticket.departureStation} - {ticket.arrivalStation}</p>
                          </div>
                          
                <div>
                            <p className="text-gray-500">Zpoždění:</p>
                            <p>{ticket.delayMinutes} min</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {claim.notes && (
                      <div className="bg-gray-50 p-2 rounded text-xs mt-2">
                        <p className="text-gray-500 mb-1">Poznámky k žádosti:</p>
                        <p className="whitespace-pre-line">{claim.notes}</p>
                      </div>
                    )}
                    
                    {claim.status === 'approved' && (
                      <div className="bg-green-50 p-2 rounded text-xs border border-green-200">
                        <p className="font-medium text-green-800">
                          Vaše žádost byla schválena a bude brzy vyplacena.
                        </p>
                      </div>
                    )}
                    
                    {claim.status === 'paid' && (
                      <div className="bg-green-50 p-2 rounded text-xs border border-green-200">
                        <p className="font-medium text-green-800">
                          Odškodnění bylo vyplaceno {claim.resolutionDate ? formatDate(claim.resolutionDate) : ''}.
                        </p>
                        {claim.bankAccount && (
                          <p className="text-green-700 mt-1">
                            Na účet: {claim.bankAccount}
                          </p>
                        )}
                </div>
                    )}
                    
                    {claim.status === 'rejected' && (
                      <div className="bg-red-50 p-2 rounded text-xs border border-red-200">
                        <p className="font-medium text-red-800">
                          Vaše žádost byla zamítnuta.
                        </p>
                        <p className="text-red-700 mt-1">
                          Důvod: Nesplňuje podmínky dopravce pro odškodnění.
                        </p>
              </div>
                    )}
              </div>
            </CardContent>
                
                {claim.status === 'pending' && (
                  <CardFooter className="flex justify-between bg-gray-50 border-t">
                    <div className="text-xs text-gray-500">
                      Průměrná doba vyřízení: 7-14 dní
                    </div>
                  </CardFooter>
                )}
          </Card>
        )
      })}
        </div>
      )}
    </div>
  )
}

