import { supabase } from './supabase';
import { Ticket, RefundClaim, REFUND_RULES, User } from './types';

// Funkce pro výpočet refundace na základě zpoždění a ceny jízdenky
export const calculateRefund = (ticket: Ticket): number => {
  if (ticket.delayMinutes < 60) return 0;
  
  // Speciální případ pro eTikety ČD
  let carrierToCheck = ticket.carrier;
  if (ticket.carrier === 'cd' && ticket.type === 'digital') {
    carrierToCheck = 'cd_eticket';
  }
  
  const rule = REFUND_RULES.find(
    r => r.carrier === carrierToCheck
  );
  
  if (!rule) return 0;
  
  // Najít konkrétní podmínku na základě zpoždění
  const ruleCondition = rule.rules.find(
    condition => 
      ticket.delayMinutes >= condition.minDelayMinutes && 
      (!condition.maxDelayMinutes || ticket.delayMinutes <= condition.maxDelayMinutes)
  );
  
  if (!ruleCondition) return 0;
  
  // Výpočet částky refundace
  let amount = 0;
  if (ruleCondition.type === 'percentage') {
    amount = Math.round((ticket.price * ruleCondition.value) / 100);
  } else {
    amount = ruleCondition.value;
  }
  
  return amount;
};

// Služba pro práci s jízdenkami
export const ticketService = {
  /**
   * Získání všech jízdenek pro uživatele
   */
  getTicketsForUser: async (userId: string): Promise<Ticket[]> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Konverze z DB formátu na formát aplikace
      return data.map((ticket: any): Ticket => ({
        id: ticket.id,
        userId: ticket.user_id,
        type: ticket.type,
        transportType: ticket.transport_type,
        carrier: ticket.carrier,
        routeNumber: ticket.route_number,
        departureStation: ticket.departure_station,
        arrivalStation: ticket.arrival_station,
        departureDate: ticket.departure_date,
        departureTime: ticket.departure_time,
        arrivalDate: ticket.arrival_date,
        arrivalTime: ticket.arrival_time,
        status: ticket.status,
        delayMinutes: ticket.delay_minutes,
        price: ticket.price,
        imageUrl: ticket.image_url
      }));
    } catch (error) {
      console.error('Chyba při načítání jízdenek:', error);
      return [];
    }
  },

  /**
   * Získání konkrétní jízdenky
   */
  getTicketById: async (ticketId: string): Promise<Ticket | null> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        transportType: data.transport_type,
        carrier: data.carrier,
        routeNumber: data.route_number,
        departureStation: data.departure_station,
        arrivalStation: data.arrival_station,
        departureDate: data.departure_date,
        departureTime: data.departure_time,
        arrivalDate: data.arrival_date,
        arrivalTime: data.arrival_time,
        status: data.status,
        delayMinutes: data.delay_minutes,
        price: data.price,
        imageUrl: data.image_url
      };
    } catch (error) {
      console.error('Chyba při načítání jízdenky:', error);
      return null;
    }
  },

  /**
   * Vytvoření nové jízdenky
   */
  createTicket: async (ticketData: Omit<Ticket, 'id'>): Promise<Ticket | null> => {
    try {
      // Konverze do DB formátu
      const dbTicket = {
        user_id: ticketData.userId,
        type: ticketData.type,
        transport_type: ticketData.transportType,
        carrier: ticketData.carrier,
        route_number: ticketData.routeNumber,
        departure_station: ticketData.departureStation,
        arrival_station: ticketData.arrivalStation,
        departure_date: ticketData.departureDate,
        departure_time: ticketData.departureTime,
        arrival_date: ticketData.arrivalDate,
        arrival_time: ticketData.arrivalTime,
        status: ticketData.status,
        delay_minutes: ticketData.delayMinutes,
        price: ticketData.price,
        image_url: ticketData.imageUrl
      };
      
      const { data, error } = await supabase
        .from('tickets')
        .insert(dbTicket)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        transportType: data.transport_type,
        carrier: data.carrier,
        routeNumber: data.route_number,
        departureStation: data.departure_station,
        arrivalStation: data.arrival_station,
        departureDate: data.departure_date,
        departureTime: data.departure_time,
        arrivalDate: data.arrival_date,
        arrivalTime: data.arrival_time,
        status: data.status,
        delayMinutes: data.delay_minutes,
        price: data.price,
        imageUrl: data.image_url
      };
    } catch (error) {
      console.error('Chyba při vytváření jízdenky:', error);
      return null;
    }
  },

  /**
   * Aktualizace jízdenky
   */
  updateTicket: async (ticketId: string, ticketData: Partial<Ticket>): Promise<Ticket | null> => {
    try {
      // Konverze do DB formátu
      const dbTicket: any = {};
      
      if (ticketData.userId) dbTicket.user_id = ticketData.userId;
      if (ticketData.type) dbTicket.type = ticketData.type;
      if (ticketData.transportType) dbTicket.transport_type = ticketData.transportType;
      if (ticketData.carrier) dbTicket.carrier = ticketData.carrier;
      if (ticketData.routeNumber) dbTicket.route_number = ticketData.routeNumber;
      if (ticketData.departureStation) dbTicket.departure_station = ticketData.departureStation;
      if (ticketData.arrivalStation) dbTicket.arrival_station = ticketData.arrivalStation;
      if (ticketData.departureDate) dbTicket.departure_date = ticketData.departureDate;
      if (ticketData.departureTime) dbTicket.departure_time = ticketData.departureTime;
      if (ticketData.arrivalDate) dbTicket.arrival_date = ticketData.arrivalDate;
      if (ticketData.arrivalTime) dbTicket.arrival_time = ticketData.arrivalTime;
      if (ticketData.status) dbTicket.status = ticketData.status;
      if (ticketData.delayMinutes !== undefined) dbTicket.delay_minutes = ticketData.delayMinutes;
      if (ticketData.price !== undefined) dbTicket.price = ticketData.price;
      if (ticketData.imageUrl) dbTicket.image_url = ticketData.imageUrl;
      
      const { data, error } = await supabase
        .from('tickets')
        .update(dbTicket)
        .eq('id', ticketId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        transportType: data.transport_type,
        carrier: data.carrier,
        routeNumber: data.route_number,
        departureStation: data.departure_station,
        arrivalStation: data.arrival_station,
        departureDate: data.departure_date,
        departureTime: data.departure_time,
        arrivalDate: data.arrival_date,
        arrivalTime: data.arrival_time,
        status: data.status,
        delayMinutes: data.delay_minutes,
        price: data.price,
        imageUrl: data.image_url
      };
    } catch (error) {
      console.error('Chyba při aktualizaci jízdenky:', error);
      return null;
    }
  },

  /**
   * Odstranění jízdenky
   */
  deleteTicket: async (ticketId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Chyba při odstraňování jízdenky:', error);
      return false;
    }
  },

  /**
   * Aktualizace zpoždění jízdenky
   */
  updateTicketDelay: async (ticketId: string, delayMinutes: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ delay_minutes: delayMinutes })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Chyba při aktualizaci zpoždění:', error);
      return false;
    }
  }
};

// Služba pro práci s žádostmi o vrácení peněz
export const claimService = {
  /**
   * Získání všech žádostí o vrácení peněz pro uživatele
   */
  getClaimsForUser: async (userId: string): Promise<RefundClaim[]> => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*, tickets(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Konverze z DB formátu na formát aplikace
      return data.map((claim: any): RefundClaim => ({
        id: claim.id,
        ticketId: claim.ticket_id,
        userId: claim.user_id,
        status: claim.status,
        amount: claim.amount,
        submissionDate: claim.submission_date,
        resolutionDate: claim.resolution_date,
        carrier: claim.carrier,
        bankAccount: claim.bank_account,
        notes: claim.notes,
        ticket: claim.tickets ? {
          id: claim.tickets.id,
          userId: claim.tickets.user_id,
          type: claim.tickets.type,
          transportType: claim.tickets.transport_type,
          carrier: claim.tickets.carrier,
          routeNumber: claim.tickets.route_number,
          departureStation: claim.tickets.departure_station,
          arrivalStation: claim.tickets.arrival_station,
          departureDate: claim.tickets.departure_date,
          departureTime: claim.tickets.departure_time,
          arrivalDate: claim.tickets.arrival_date,
          arrivalTime: claim.tickets.arrival_time,
          status: claim.tickets.status,
          delayMinutes: claim.tickets.delay_minutes,
          price: claim.tickets.price,
          imageUrl: claim.tickets.image_url
        } : undefined
      }));
    } catch (error) {
      console.error('Chyba při načítání žádostí o vrácení peněz:', error);
      return [];
    }
  },

  /**
   * Vytvoření nové žádosti o vrácení peněz
   */
  createClaim: async (ticketId: string, userId: string): Promise<RefundClaim | null> => {
    try {
      // Nejprve získáme jízdenku pro získání potřebných informací
      const ticket = await ticketService.getTicketById(ticketId);
      if (!ticket || !ticket.delayMinutes) {
        throw new Error('Jízdenka neexistuje nebo nemá záznam o zpoždění');
      }

      // Výpočet částky dle pravidel
      const ruleForCarrier = REFUND_RULES.find(rule => rule.carrier === ticket.carrier) 
        || REFUND_RULES.find(rule => rule.carrier === 'default')!;

      const applicableRule = ruleForCarrier.rules.find(
        rule => ticket.delayMinutes >= rule.minDelayMinutes
      );

      if (!applicableRule) {
        throw new Error('Pro toto zpoždění neexistuje pravidlo pro vrácení peněz');
      }

      // Výpočet částky
      const amount = applicableRule.type === 'fixed' 
        ? applicableRule.value 
        : Math.round((ticket.price * applicableRule.value) / 100);

      // Vytvoření žádosti
      const dbClaim = {
        ticket_id: ticketId,
        user_id: userId,
        status: 'pending',
        amount,
        carrier: ticket.carrier,
        bank_account: '',
        notes: `Automaticky vytvořeno na základě zpoždění ${ticket.delayMinutes} minut`
      };
      
      const { data, error } = await supabase
        .from('claims')
        .insert(dbClaim)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ticketId: data.ticket_id,
        userId: data.user_id,
        status: data.status,
        amount: data.amount,
        submissionDate: data.submission_date,
        resolutionDate: data.resolution_date,
        carrier: data.carrier,
        bankAccount: data.bank_account,
        notes: data.notes,
        ticket
      };
    } catch (error) {
      console.error('Chyba při vytváření žádosti o vrácení peněz:', error);
      return null;
    }
  },

  /**
   * Aktualizace žádosti o vrácení peněz
   */
  updateClaim: async (claimId: string, claimData: Partial<RefundClaim>): Promise<RefundClaim | null> => {
    try {
      // Konverze do DB formátu
      const dbClaim: any = {};
      
      if (claimData.status) dbClaim.status = claimData.status;
      if (claimData.amount !== undefined) dbClaim.amount = claimData.amount;
      if (claimData.resolutionDate) dbClaim.resolution_date = claimData.resolutionDate;
      if (claimData.bankAccount) dbClaim.bank_account = claimData.bankAccount;
      if (claimData.notes) dbClaim.notes = claimData.notes;
      
      const { data, error } = await supabase
        .from('claims')
        .update(dbClaim)
        .eq('id', claimId)
        .select('*, tickets(*)')
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ticketId: data.ticket_id,
        userId: data.user_id,
        status: data.status,
        amount: data.amount,
        submissionDate: data.submission_date,
        resolutionDate: data.resolution_date,
        carrier: data.carrier,
        bankAccount: data.bank_account,
        notes: data.notes,
        ticket: data.tickets ? {
          id: data.tickets.id,
          userId: data.tickets.user_id,
          type: data.tickets.type,
          transportType: data.tickets.transport_type,
          carrier: data.tickets.carrier,
          routeNumber: data.tickets.route_number,
          departureStation: data.tickets.departure_station,
          arrivalStation: data.tickets.arrival_station,
          departureDate: data.tickets.departure_date,
          departureTime: data.tickets.departure_time,
          arrivalDate: data.tickets.arrival_date,
          arrivalTime: data.tickets.arrival_time,
          status: data.tickets.status,
          delayMinutes: data.tickets.delay_minutes,
          price: data.tickets.price,
          imageUrl: data.tickets.image_url
        } : undefined
      };
    } catch (error) {
      console.error('Chyba při aktualizaci žádosti o vrácení peněz:', error);
      return null;
    }
  },

  /**
   * Odstranění žádosti o vrácení peněz
   */
  deleteClaim: async (claimId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('claims')
        .delete()
        .eq('id', claimId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Chyba při odstraňování žádosti o vrácení peněz:', error);
      return false;
    }
  }
};

// Služba pro práci s uživateli
export const userService = {
  /**
   * Přihlášení uživatele
   */
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userError) throw userError;
        
        if (userData) {
          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            address: userData.address,
            bankAccount: userData.bank_account
          };
        } else {
          // Pokud uživatel existuje v Auth, ale ne v tabulce users, vytvoříme ho
          return await userService.createUserRecord({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || '',
            phone: '',
            address: '',
            bankAccount: ''
          });
        }
      }
      
      return null;
    } catch (error) {
      console.error('Chyba při přihlašování:', error);
      return null;
    }
  },

  /**
   * Registrace uživatele
   */
  register: async (name: string, email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const user: User = {
          id: data.user.id,
          email,
          name,
          phone: '',
          address: '',
          bankAccount: ''
        };
        
        await userService.createUserRecord(user);
        
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Chyba při registraci:', error);
      return null;
    }
  },

  /**
   * Vytvoření záznamu uživatele v tabulce users
   */
  createUserRecord: async (user: User): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          bank_account: user.bankAccount
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        bankAccount: data.bank_account
      };
    } catch (error) {
      console.error('Chyba při vytváření záznamu uživatele:', error);
      return null;
    }
  },

  /**
   * Získání uživatele podle ID
   */
  getById: async (id: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        bankAccount: data.bank_account
      };
    } catch (error) {
      console.error('Chyba při načítání uživatele:', error);
      return null;
    }
  },

  /**
   * Aktualizace uživatelských dat
   */
  update: async (id: string, userData: Partial<User>): Promise<User | null> => {
    try {
      // Konverze do DB formátu
      const dbUser: any = {};
      
      if (userData.email) dbUser.email = userData.email;
      if (userData.name) dbUser.name = userData.name;
      if (userData.phone !== undefined) dbUser.phone = userData.phone;
      if (userData.address !== undefined) dbUser.address = userData.address;
      if (userData.bankAccount !== undefined) dbUser.bank_account = userData.bankAccount;
      
      const { data, error } = await supabase
        .from('users')
        .update(dbUser)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        bankAccount: data.bank_account
      };
    } catch (error) {
      console.error('Chyba při aktualizaci uživatele:', error);
      return null;
    }
  },

  /**
   * Změna hesla uživatele
   */
  changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      // Nejprve získáme email uživatele
      const user = await userService.getById(userId);
      if (!user) return false;
      
      // Přihlásíme uživatele současným heslem pro ověření
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (loginError) throw loginError;
      
      // Změníme heslo
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Chyba při změně hesla:', error);
      return false;
    }
  }
}; 