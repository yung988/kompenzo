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
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return mapSupabaseUser(data.user as SupabaseUser);
  },

  // Přihlášení pomocí emailu a hesla
  login: async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error || !data.user) return null;
    return mapSupabaseUser(data.user as SupabaseUser);
  },

  // Registrace nového uživatele
  register: async (
    email: string,
    password: string,
    userData: { name: string; phone?: string; address?: string; bankAccount?: string }
  ): Promise<User | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error || !data.user) return null;
    return mapSupabaseUser(data.user as SupabaseUser);
  },

  // Odhlášení
  logout: async (): Promise<boolean> => {
    const { error } = await supabase.auth.signOut();
    return !error;
  },

  // Aktualizace uživatelských dat
  updateUserProfile: async (
    userData: { name?: string; phone?: string; address?: string; bankAccount?: string }
  ): Promise<User | null> => {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    
    if (error || !data.user) return null;
    return mapSupabaseUser(data.user as SupabaseUser);
  }
}; 