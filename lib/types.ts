export type TransportType = 'train' | 'bus';
export type TicketType = 'digital' | 'scanned';
export type TicketStatus = 'active' | 'used' | 'expired' | 'cancelled' | 'delayed';
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'paid';
export type CarrierType = 'cd' | 'cd_eticket' | 'regiojet' | 'flixbus' | 'other' | 'default';

export interface Ticket {
  id: string;
  userId: string;
  type: TicketType;
  transportType: TransportType;
  carrier: CarrierType;
  routeNumber: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  status: TicketStatus;
  delayMinutes: number;
  price: number;
  imageUrl?: string;
  created?: string;
}

export interface RefundClaim {
  id: string;
  ticketId: string;
  userId: string;
  status: RefundStatus;
  amount: number;
  submissionDate: string;
  resolutionDate?: string;
  carrier: CarrierType;
  bankAccount?: string;
  notes?: string;
  ticket?: Ticket; // Reference na přidruženou jízdenku
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  bankAccount?: string;
}

// Pravidla pro odškodnění
interface RefundRuleCondition {
  minDelayMinutes: number;
  maxDelayMinutes?: number;
  type: 'fixed' | 'percentage';
  value: number; // Buď fixní částka, nebo procento z ceny
}

export interface RefundRule {
  carrier: CarrierType;
  rules: RefundRuleCondition[];
}

// Pravidla refundací podle dopravců
export const REFUND_RULES: RefundRule[] = [
  {
    carrier: 'cd',
    rules: [
      {
        minDelayMinutes: 60,
        maxDelayMinutes: 119,
        type: 'percentage',
        value: 25
      },
      {
        minDelayMinutes: 120,
        type: 'percentage',
        value: 50
      }
    ]
  },
  {
    carrier: 'cd_eticket',
    rules: [
      {
        minDelayMinutes: 60,
        maxDelayMinutes: 119,
        type: 'percentage',
        value: 25
      },
      {
        minDelayMinutes: 120,
        type: 'percentage',
        value: 50
      }
    ]
  },
  {
    carrier: 'regiojet',
    rules: [
      {
        minDelayMinutes: 60,
        maxDelayMinutes: 119,
        type: 'percentage',
        value: 25
      },
      {
        minDelayMinutes: 120,
        type: 'percentage',
        value: 50
      }
    ]
  },
  {
    carrier: 'flixbus',
    rules: [
      {
        minDelayMinutes: 120,
        type: 'percentage',
        value: 25
      }
    ]
  },
  {
    carrier: 'default',
    rules: [
      {
        minDelayMinutes: 60,
        maxDelayMinutes: 119,
        type: 'percentage',
        value: 25
      },
      {
        minDelayMinutes: 120,
        type: 'percentage',
        value: 50
      }
    ]
  }
]; 