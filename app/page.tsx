'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBetterAuth } from '@/lib/better-auth'
import { ticketService, claimService } from '@/lib/api-supabase'
import { Ticket, RefundClaim } from '@/lib/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Clock,
  Train,
  Bus,
  Plus,
  TicketIcon,
  CreditCard,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useBetterAuth()
  const [dataLoading, setDataLoading] = useState(true)
  const [ticketCount, setTicketCount] = useState(0)
  const [claimCount, setClaimCount] = useState(0)
  const [approvedClaimCount, setApprovedClaimCount] = useState(0)
  const [totalRefunded, setTotalRefunded] = useState(0)
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Načtení jízdenek
          const tickets = await ticketService.getTicketsForUser(user.id)
          setTicketCount(tickets.length)
          setRecentTickets(tickets.slice(0, 3)) // Poslední 3 jízdenky
          
          // Načtení žádostí o odškodnění
          const claims = await claimService.getClaimsForUser(user.id)
          setClaimCount(claims.length)
          
          // Filtrujeme jen schválené žádosti pro výpočet celkové částky
          const approvedClaims = claims.filter(claim => claim.status === 'approved')
          setApprovedClaimCount(approvedClaims.length)
          
          // Výpočet celkové částky za schválené žádosti
          const totalAmount = approvedClaims.reduce((sum, claim) => sum + claim.amount, 0)
          setTotalRefunded(totalAmount)
        } catch (error) {
          console.error("Chyba při načítání dat:", error)
        } finally {
          setDataLoading(false)
        }
      } else {
        setDataLoading(false)
      }
    }
    
    if (!isLoading) {
      loadData()
    }
  }, [user, isLoading])

  // Pomocné funkce pro formátování
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('cs-CZ', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', { 
      style: 'currency', 
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getTransportIcon = (type: 'train' | 'bus') => {
    return type === 'train' ? (
      <Train className="h-5 w-5 text-blue-500" />
    ) : (
      <Bus className="h-5 w-5 text-green-500" />
    )
  }

  if (isLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-blue-800 sm:text-5xl">
            Získejte odškodnění za zpožděné vlaky a autobusy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kompenzo automatizuje proces žádání o odškodnění za zpožděné spoje. Šetříme váš čas a maximalizujeme úspěšnost žádostí.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Začít zdarma
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">
                Přihlásit se
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Úspora času</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automatizujeme zdlouhavý proces podávání žádostí o odškodnění za zpožděné spoje.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="space-y-1">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Získejte své peníze zpět</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Máte nárok na odškodnění za zpoždění. My zajistíme, že ho skutečně dostanete.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="space-y-1">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                <TicketIcon className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Pro všechny druhy jízdenek</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Podporujeme odškodnění pro jednotlivé jízdenky, eTickety i časové kupóny u většiny dopravců.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Dashboard</h1>
        <Button asChild>
          <Link href="/tickets/add">
            <Plus className="mr-2 h-4 w-4" />
            Přidat jízdenku
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Celkem jízdenek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">{ticketCount}</span>
              <TicketIcon className="h-5 w-5 text-blue-500 mb-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Žádostí o odškodnění
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">{claimCount}</span>
              <CreditCard className="h-5 w-5 text-purple-500 mb-1" />
            </div>
            {approvedClaimCount > 0 && (
              <p className="text-sm text-orange-500 mt-1">
                {approvedClaimCount} schválených
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Získáno odškodnění
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">{formatPrice(totalRefunded)}</span>
              <TrendingUp className="h-5 w-5 text-green-500 mb-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Úspěšnost žádostí
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">
                {claimCount ? Math.round((approvedClaimCount / claimCount) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Nedávné jízdenky</TabsTrigger>
          <TabsTrigger value="actions">Rychlé akce</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          {recentTickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Žádné jízdenky</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Zatím jste nepřidali žádné jízdenky. Začněte přidáním své první jízdenky.
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/tickets/add">
                        <Plus className="mr-2 h-4 w-4" />
                        Přidat jízdenku
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            recentTickets.map(ticket => (
              <Card key={ticket.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      {getTransportIcon(ticket.transportType)}
                      <CardTitle className="text-lg">
                        {ticket.departureStation} → {ticket.arrivalStation}
                      </CardTitle>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(ticket.departureDate)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Spoj: <strong>{ticket.routeNumber}</strong>
                    </span>
                    <span>
                      Cena: <strong>{formatPrice(ticket.price)}</strong>
                    </span>
                    {ticket.delayMinutes > 0 && (
                      <span className="text-red-500">
                        Zpoždění: <strong>{ticket.delayMinutes} min</strong>
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="ml-auto">
                    <Link href={`/tickets/${ticket.id}`}>
                      Detail <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
          
          {recentTickets.length > 0 && (
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/tickets">
                  Zobrazit všechny jízdenky
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="actions">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Přidat novou jízdenku</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Zaznamenejte si novou jízdenku pro pozdější žádost o odškodnění v případě zpoždění.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/tickets/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Přidat jízdenku
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zkontrolovat stav žádostí</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Podívejte se na aktuální stav vašich žádostí o odškodnění za zpožděné spoje.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/refunds">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Moje žádosti
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

