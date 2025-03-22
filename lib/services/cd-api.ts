import { z } from 'zod';

// Schéma pro validaci odpovědi z API
const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  fullname: z.string().optional(),
  type: z.number()
});

const connectionSchema = z.object({
  id: z.number(),
  trains: z.array(z.object({
    trainData: z.object({
      number: z.number(),
      type: z.string(),
      name: z.string().optional(),
      from: z.object({
        name: z.string(),
        time: z.string()
      }),
      to: z.object({
        name: z.string(),
        time: z.string()
      }),
      delay: z.number().optional()
    })
  })),
  priceOffers: z.object({
    offers: z.array(z.object({
      price: z.number()
    })).optional()
  })
});

export type CdLocation = z.infer<typeof locationSchema>;
export type CdConnection = z.infer<typeof connectionSchema>;

// Služba pro komunikaci s ČD API
export const cdApiService = {
  /**
   * Vyhledá stanici podle zadaného dotazu
   */
  searchLocations: async (query: string): Promise<CdLocation[]> => {
    try {
      const response = await fetch(`https://ticket-api.cd.cz/v1/locations?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Chyba při vyhledávání stanic: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.locations || [];
    } catch (error) {
      console.error('Chyba při vyhledávání stanic:', error);
      return [];
    }
  },
  
  /**
   * Vyhledá spojení mezi stanicemi
   */
  searchConnections: async (
    fromLocation: string, 
    toLocation: string, 
    departureDate: string
  ): Promise<CdConnection[]> => {
    try {
      const url = new URL('https://ticket-api.cd.cz/v1/connections');
      
      // Zjistíme, zda parametry jsou ID stanic nebo názvy
      const isFromLocationId = fromLocation.length < 10 && /^\d+$/.test(fromLocation);
      const isToLocationId = toLocation.length < 10 && /^\d+$/.test(toLocation);
      
      // Nastavíme správné parametry podle typu vstupu
      if (isFromLocationId) {
        url.searchParams.append('fromLocationId', fromLocation);
      } else {
        url.searchParams.append('fromLocationName', fromLocation);
      }
      
      if (isToLocationId) {
        url.searchParams.append('toLocationId', toLocation);
      } else {
        url.searchParams.append('toLocationName', toLocation);
      }
      
      url.searchParams.append('departureDate', departureDate);
      
      console.log("Volám API:", url.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Chyba při vyhledávání spojení: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.result !== 0 || !data.connInfo) {
        console.warn('API vrátilo chybu nebo prázdná data:', data);
        return [];
      }
      
      return data.connInfo.connections || [];
    } catch (error) {
      console.error('Chyba při vyhledávání spojení:', error);
      return [];
    }
  },
  
  /**
   * Zjistí aktuální zpoždění vlaku
   */
  getTrainDelay: async (trainNumber: number, date: string): Promise<number> => {
    try {
      const url = new URL('https://ticket-api.cd.cz/v1/trains');
      url.searchParams.append('trainNumber', trainNumber.toString());
      url.searchParams.append('date', date);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Chyba při zjišťování zpoždění: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.delay || 0;
    } catch (error) {
      console.error('Chyba při zjišťování zpoždění:', error);
      return 0;
    }
  }
}; 