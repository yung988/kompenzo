import { Ticket, RefundClaim, REFUND_RULES, RefundRule, CarrierType } from './types';

// Mock data pro demonstraci
const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'digital',
    transportType: 'train',
    carrier: 'cd',
    routeNumber: 'R123',
    departureStation: 'Praha hl.n.',
    arrivalStation: 'Brno hl.n.',
    departureDate: '2023-06-10',
    departureTime: '14:30',
    arrivalDate: '2023-06-10',
    arrivalTime: '16:45',
    status: 'active',
    delayMinutes: 0,
    price: 450,
    created: '2023-06-01'
  },
  {
    id: '2',
    userId: 'user1',
    type: 'scanned',
    transportType: 'train',
    carrier: 'cd',
    routeNumber: 'EC176',
    departureStation: 'Praha hl.n.',
    arrivalStation: 'Ostrava hl.n.',
    departureDate: '2023-06-15',
    departureTime: '09:00',
    arrivalDate: '2023-06-15',
    arrivalTime: '11:30',
    status: 'used',
    delayMinutes: 75,
    price: 580,
    created: '2023-06-12'
  }
];

const MOCK_CLAIMS: RefundClaim[] = [
  {
    id: 'claim1',
    ticketId: '2',
    userId: 'user1',
    status: 'pending',
    amount: 145, // 25% z 580 Kč
    submissionDate: '2023-06-15',
    carrier: 'cd',
    notes: 'Zpoždění kvůli technické závadě'
  }
];

// Helper pro generování unikátních ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper pro práci s localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Inicializace úložiště při prvním načtení
const initStorage = () => {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('tickets')) {
      saveToStorage('tickets', MOCK_TICKETS);
    }
    if (!localStorage.getItem('claims')) {
      saveToStorage('claims', MOCK_CLAIMS);
    }
  }
};

// Funkce pro výpočet refundace na základě zpoždění a ceny jízdenky
export const calculateRefund = (ticket: Ticket): number => {
  if (ticket.delayMinutes < 60) return 0;
  
  const rule = REFUND_RULES.find(
    r => r.carrier === ticket.carrier && 
         ticket.delayMinutes >= r.minDelay && 
         (!r.maxDelay || ticket.delayMinutes <= r.maxDelay)
  );
  
  if (!rule) return 0;
  
  const amount = ticket.price * (rule.percentRefund / 100);
  return Math.max(amount, rule.minPrice);
};

// API služby pro jízdenky
export const ticketService = {
  getAll: (): Ticket[] => {
    initStorage();
    return getFromStorage<Ticket[]>('tickets', []);
  },
  
  getByUser: (userId: string): Ticket[] => {
    return ticketService.getAll().filter(ticket => ticket.userId === userId);
  },
  
  getById: (id: string): Ticket | undefined => {
    return ticketService.getAll().find(ticket => ticket.id === id);
  },
  
  create: (ticket: Omit<Ticket, 'id' | 'created'>): Ticket => {
    const newTicket: Ticket = {
      ...ticket,
      id: generateId(),
      created: new Date().toISOString()
    };
    
    const tickets = ticketService.getAll();
    saveToStorage('tickets', [...tickets, newTicket]);
    
    return newTicket;
  },
  
  update: (id: string, data: Partial<Ticket>): Ticket | undefined => {
    const tickets = ticketService.getAll();
    const index = tickets.findIndex(t => t.id === id);
    
    if (index === -1) return undefined;
    
    const updatedTicket = { ...tickets[index], ...data };
    tickets[index] = updatedTicket;
    
    saveToStorage('tickets', tickets);
    return updatedTicket;
  },
  
  delete: (id: string): boolean => {
    const tickets = ticketService.getAll();
    const filteredTickets = tickets.filter(t => t.id !== id);
    
    if (filteredTickets.length === tickets.length) return false;
    
    saveToStorage('tickets', filteredTickets);
    return true;
  }
};

// API služby pro žádosti o refundaci
export const claimService = {
  getAll: (): RefundClaim[] => {
    initStorage();
    return getFromStorage<RefundClaim[]>('claims', []);
  },
  
  getByUser: (userId: string): RefundClaim[] => {
    return claimService.getAll().filter(claim => claim.userId === userId);
  },
  
  getById: (id: string): RefundClaim | undefined => {
    return claimService.getAll().find(claim => claim.id === id);
  },
  
  create: (claim: Omit<RefundClaim, 'id' | 'submissionDate'>): RefundClaim => {
    const newClaim: RefundClaim = {
      ...claim,
      id: generateId(),
      submissionDate: new Date().toISOString()
    };
    
    const claims = claimService.getAll();
    saveToStorage('claims', [...claims, newClaim]);
    
    return newClaim;
  },
  
  update: (id: string, data: Partial<RefundClaim>): RefundClaim | undefined => {
    const claims = claimService.getAll();
    const index = claims.findIndex(c => c.id === id);
    
    if (index === -1) return undefined;
    
    const updatedClaim = { ...claims[index], ...data };
    claims[index] = updatedClaim;
    
    saveToStorage('claims', claims);
    return updatedClaim;
  },
  
  delete: (id: string): boolean => {
    const claims = claimService.getAll();
    const filteredClaims = claims.filter(c => c.id !== id);
    
    if (filteredClaims.length === claims.length) return false;
    
    saveToStorage('claims', filteredClaims);
    return true;
  }
}; 