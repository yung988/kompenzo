'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { ticketService, claimService } from '@/lib/api-supabase'
import { calculateRefund } from '@/lib/api-supabase'
import { Ticket, RefundStatus } from '@/lib/types'

export default function SubmitClaim() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  const { currentUser, isAuthenticated } = useAuth();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bankAccount: '',
    reasonForDelay: '',
    notes: '',
    paymentMethod: 'bank'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bankAccount: currentUser.bankAccount || ''
      }));
    }

    const fetchTicket = async () => {
      if (!ticketId) return;
      
      setIsLoadingTicket(true);
      try {
        const ticketData = await ticketService.getTicketById(ticketId);
        if (ticketData) {
          setTicket(ticketData);
          const amount = calculateRefund(ticketData);
          setRefundAmount(amount);
        }
      } catch (err) {
        console.error('Chyba při načítání jízdenky:', err);
      } finally {
        setIsLoadingTicket(false);
      }
    };

    fetchTicket();
  }, [ticketId, currentUser, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticket || !currentUser?.id) {
      setSubmitMessage({
        type: 'error',
        text: 'Chybí jízdenka nebo nejste přihlášeni'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    try {
      setIsSubmitting(true);
      
      if (!ticket) return;
      
      // Vytvoření žádosti o refundaci
      const claimResult = await claimService.createClaim(ticket.id, currentUser.id);
      
      if (claimResult) {
        setSubmitMessage({
          type: 'success',
          text: 'Vaše žádost o refundaci byla úspěšně odeslána. O stavu žádosti vás budeme informovat.'
        });
        
        // Přesměrování po úspěšném odeslání
        setTimeout(() => {
          router.push('/refunds');
        }, 3000);
      } else {
        setSubmitMessage({
          type: 'error',
          text: 'Nepodařilo se odeslat žádost. Zkuste to prosím znovu.'
        });
      }
    } catch (err) {
      console.error('Chyba při odesílání žádosti:', err);
      setSubmitMessage({
        type: 'error',
        text: 'Došlo k chybě při zpracování žádosti. Zkuste to prosím znovu.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTicket) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Načítání údajů o jízdence...</p>
      </div>
    );
  }

  if (!ticket && ticketId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Jízdenka nebyla nalezena
        </div>
        <Button onClick={() => router.push('/tickets')}>Zpět na jízdenky</Button>
      </div>
    );
  }

  if (!ticketId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Pro podání žádosti o refundaci je nutné vybrat jízdenku
        </div>
        <Button onClick={() => router.push('/tickets')}>Vybrat jízdenku</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 text-center text-blue-800">Žádost o odškodnění</h1>
      <p className="text-center text-gray-600 mb-6">
        Pomocí tohoto formuláře můžete jednoduše odeslat žádost o odškodnění při zpoždění vlaku.
      </p>
      
      {submitMessage && (
        <div className={`border px-4 py-3 rounded mb-4 ${
          submitMessage.type === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          {submitMessage.text}
        </div>
      )}
      
      {ticket && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold text-lg mb-2">Informace o jízdence</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Dopravce:</div>
            <div>{ticket.carrier === 'cd' ? 'České dráhy' : ticket.carrier}</div>
            
            <div>Spoj:</div>
            <div>{ticket.transportType === 'train' ? 'Vlak' : 'Autobus'} {ticket.routeNumber}</div>
            
            <div>Z:</div>
            <div>{ticket.departureStation}</div>
            
            <div>Do:</div>
            <div>{ticket.arrivalStation}</div>
            
            <div>Datum odjezdu:</div>
            <div>{ticket.departureDate}</div>
            
            <div>Zpoždění:</div>
            <div>{ticket.delayMinutes} minut</div>
            
            <div>Cena jízdenky:</div>
            <div>{ticket.price} Kč</div>
            
            <div>Nárok na odškodnění:</div>
            <div className="font-bold">{refundAmount} Kč</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Jméno a příjmení</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input 
              id="phone" 
              name="phone" 
              type="tel" 
              value={formData.phone} 
              onChange={handleChange}
            />
          </div>
          
          <div>
            <Label htmlFor="paymentMethod">Způsob výplaty odškodnění</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value: string) => handleSelectChange('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte způsob výplaty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bankovní převod</SelectItem>
                <SelectItem value="credit">Dobropis pro další cestu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {formData.paymentMethod === 'bank' && (
          <div>
            <Label htmlFor="bankAccount">Číslo bankovního účtu</Label>
            <Input 
              id="bankAccount" 
              name="bankAccount" 
              value={formData.bankAccount} 
              onChange={handleChange} 
              placeholder="např. 2300123456/2010"
              required={formData.paymentMethod === 'bank'} 
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="reasonForDelay">Důvod zpoždění (pokud je znám)</Label>
          <Select 
            value={formData.reasonForDelay} 
            onValueChange={(value: string) => handleSelectChange('reasonForDelay', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Vyberte důvod zpoždění" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technická závada">Technická závada</SelectItem>
              <SelectItem value="počasí">Nepříznivé počasí</SelectItem>
              <SelectItem value="výluky">Výluky na trati</SelectItem>
              <SelectItem value="nehoda">Nehoda na trati</SelectItem>
              <SelectItem value="provozní důvody">Provozní důvody</SelectItem>
              <SelectItem value="jiné">Jiné</SelectItem>
              <SelectItem value="neznámý">Není známo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="notes">Doplňující informace</Label>
          <Textarea 
            id="notes" 
            name="notes" 
            value={formData.notes} 
            onChange={handleChange} 
            placeholder="Případné další informace k vaší žádosti"
            className="h-24"
          />
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg text-sm">
          <p className="font-semibold mb-2">Důležité informace:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Vaše žádost bude vyřízena do jednoho měsíce.</li>
            <li>Převzetí žádosti neznamená automatické potvrzení nároku na odškodnění.</li>
            <li>Pro odškodnění je nutné, aby zpoždění bylo minimálně 60 minut.</li>
            <li>Výše odškodnění je 25% z ceny jízdenky při zpoždění 60-119 minut.</li>
            <li>Výše odškodnění je 50% z ceny jízdenky při zpoždění 120 a více minut.</li>
          </ul>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || !ticket || refundAmount <= 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Odesílání žádosti...
            </>
          ) : (
            'Odeslat žádost o refundaci'
          )}
        </Button>
        
        {refundAmount <= 0 && ticket && (
          <div className="text-red-500 text-sm text-center">
            Na základě pravidel dopravce nemáte nárok na odškodnění. 
            Buď je zpoždění příliš malé, nebo cena jízdenky nesplňuje minimální požadovanou hodnotu.
          </div>
        )}
      </form>
    </div>
  );
}

