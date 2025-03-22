import { supabase } from './supabase';
import { User } from './types';

// Typ pro přihlášeného uživatele ze Supabase
export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    address?: string;
    bankAccount?: string;
  };
}

// Konverze Supabase uživatele na našeho uživatele
export const mapSupabaseUser = (user: SupabaseUser): User => {
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || '',
    phone: user.user_metadata?.phone,
    address: user.user_metadata?.address,
    bankAccount: user.user_metadata?.bankAccount
  };
};

export const authService = {
  // Kontrola, zda je uživatel přihlášen
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Chyba při získávání aktuálního uživatele:', error);
        return null;
      }
      
      if (!data.user) {
        console.log('Žádný přihlášený uživatel');
        return null;
      }
      
      console.log('Aktuální uživatel:', data.user);
      return mapSupabaseUser(data.user as SupabaseUser);
    } catch (err) {
      console.error('Neočekávaná chyba při získávání uživatele:', err);
      return null;
    }
  },

  // Přihlášení pomocí emailu a hesla
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      console.log('Pokus o přihlášení uživatele:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Chyba při přihlašování:', error.message);
        throw new Error(`Přihlášení selhalo: ${error.message}`);
      }
      
      if (!data.user) {
        console.error('Přihlášení vrátilo prázdná data uživatele');
        return null;
      }
      
      console.log('Uživatel úspěšně přihlášen:', data.user.id);
      return mapSupabaseUser(data.user as SupabaseUser);
    } catch (err) {
      console.error('Neočekávaná chyba při přihlášení:', err);
      throw err;
    }
  },

  // Registrace nového uživatele
  register: async (
    email: string,
    password: string,
    userData: { name: string; phone?: string; address?: string; bankAccount?: string }
  ): Promise<User | null> => {
    try {
      console.log('Pokus o registraci nového uživatele:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        console.error('Chyba při registraci:', error.message);
        throw new Error(`Registrace selhala: ${error.message}`);
      }
      
      if (!data.user) {
        console.error('Registrace vrátila prázdná data uživatele');
        return null;
      }
      
      console.log('Uživatel úspěšně registrován:', data.user.id);
      console.log('Je potřeba potvrdit email?', data.session ? 'Ne' : 'Ano');
      
      return mapSupabaseUser(data.user as SupabaseUser);
    } catch (err) {
      console.error('Neočekávaná chyba při registraci:', err);
      throw err;
    }
  },

  // Odhlášení
  logout: async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Chyba při odhlašování:', error.message);
        return false;
      }
      
      console.log('Uživatel úspěšně odhlášen');
      return true;
    } catch (err) {
      console.error('Neočekávaná chyba při odhlášení:', err);
      return false;
    }
  },

  // Aktualizace uživatelských dat
  updateUserProfile: async (
    userData: { name?: string; phone?: string; address?: string; bankAccount?: string }
  ): Promise<User | null> => {
    try {
      console.log('Pokus o aktualizaci profilu uživatele');
      
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) {
        console.error('Chyba při aktualizaci profilu:', error.message);
        return null;
      }
      
      if (!data.user) {
        console.error('Aktualizace vrátila prázdná data uživatele');
        return null;
      }
      
      console.log('Profil uživatele úspěšně aktualizován');
      return mapSupabaseUser(data.user as SupabaseUser);
    } catch (err) {
      console.error('Neočekávaná chyba při aktualizaci profilu:', err);
      return null;
    }
  }
}; 