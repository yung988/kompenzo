import { ticketService } from '../api-supabase'
import { cdApiService } from './cd-api'
import { claimService } from '../api-supabase'
import { Ticket } from '../types'
import { calculateRefund } from '../api'

/**
 * Služba pro monitorování zpoždění vlaků a automatické zpracování odškodnění
 */
export const delayMonitorService = {
  /**
   * Zkontroluje zpoždění pro všechny aktivní jízdenky konkrétního uživatele
   * a aktualizuje jejich stav, případně vytvoří žádost o odškodnění
   */
  monitorUserTickets: async (userId: string): Promise<{
    updatedTickets: number;
    newClaims: number;
  }> => {
    try {
      // Načtení aktivních jízdenek uživatele
      const tickets = await ticketService.getTicketsForUser(userId);
      const activeTickets = tickets.filter(
        (ticket) => 
          ticket.status === 'active' && 
          ticket.carrier === 'cd' && 
          ticket.transportType === 'train' &&
          ticket.delayMinutes < 60 && // Kontrolujeme pouze jízdenky, které ještě nemají potvrzené zpoždění
          // Kontrola pouze nedávných jízdenek (např. z posledních 14 dnů)
          new Date(ticket.departureDate) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      );

      if (activeTickets.length === 0) {
        return { updatedTickets: 0, newClaims: 0 };
      }

      let updatedCount = 0;
      let newClaimsCount = 0;

      // Kontrola zpoždění pro každou jízdenku
      for (const ticket of activeTickets) {
        const trainNumber = parseInt(ticket.routeNumber.replace(/\D/g, ''), 10);
        if (isNaN(trainNumber)) continue;

        // Kontrola zpoždění pro konkrétní vlak
        const delay = await cdApiService.getTrainDelay(trainNumber, ticket.departureDate);
        
        if (delay > ticket.delayMinutes) {
          // Aktualizace jízdenky se zpožděním
          const updatedTicket = await ticketService.updateTicket(ticket.id, {
            delayMinutes: delay,
            status: delay >= 60 ? 'delayed' : 'active'
          });

          if (updatedTicket) {
            updatedCount++;
            
            // Pokud je zpoždění >= 60 minut, vytvoříme žádost o odškodnění
            if (delay >= 60) {
              await createRefundClaim(userId, updatedTicket);
              newClaimsCount++;
            }
          }
        }
      }

      return {
        updatedTickets: updatedCount,
        newClaims: newClaimsCount
      };
    } catch (error) {
      console.error('Chyba při monitorování zpoždění:', error);
      return {
        updatedTickets: 0,
        newClaims: 0
      };
    }
  },

  /**
   * Naplánuje pravidelné kontroly zpoždění pro konkrétního uživatele
   */
  scheduleMonitoring: (userId: string, intervalMinutes: number = 60): NodeJS.Timeout => {
    // Kontrola každých X minut
    const intervalId = setInterval(async () => {
      await delayMonitorService.monitorUserTickets(userId);
    }, intervalMinutes * 60 * 1000);

    return intervalId;
  },

  /**
   * Zastaví pravidelné kontroly zpoždění
   */
  stopMonitoring: (intervalId: NodeJS.Timeout): void => {
    clearInterval(intervalId);
  }
};

/**
 * Pomocná funkce pro vytvoření žádosti o odškodnění
 */
async function createRefundClaim(userId: string, ticket: Ticket) {
  const refundAmount = calculateRefund(ticket);
  
  if (refundAmount <= 0) return null;

  // Kontrola, zda už neexistuje žádost pro tuto jízdenku
  const existingClaims = await claimService.getClaimsForUser(userId);
  const hasExistingClaim = existingClaims.some(claim => claim.ticketId === ticket.id);
  if (hasExistingClaim) return null;

  return await claimService.createClaim(ticket.id, userId);
} 