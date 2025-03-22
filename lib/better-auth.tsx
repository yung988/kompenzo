'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User } from './types';

// Interface pro auth context
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, userData: { 
    name: string; 
    phone?: string; 
    address?: string; 
    bankAccount?: string 
  }) => Promise<User | null>;
  logout: () => Promise<boolean>;
  updateProfile: (userData: { 
    name?: string; 
    phone?: string; 
    address?: string; 
    bankAccount?: string 
  }) => Promise<User | null>;
  clearError: () => void;
}

// Create context with a default empty value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase user to our app's user format
export const mapSupabaseUser = (supabaseUser: any): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || '',
    phone: supabaseUser.user_metadata?.phone,
    address: supabaseUser.user_metadata?.address,
    bankAccount: supabaseUser.user_metadata?.bankAccount
  };
};

// Provider component
export function BetterAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = () => setError(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        clearError();
        
        console.log('🔐 Kontrola existující session...');
        
        // Get the current user
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('❌ Chyba při načítání session:', error.message);
          throw error;
        }
        
        if (data?.user) {
          console.log('✅ Uživatel načten:', data.user.id);
          setUser(mapSupabaseUser(data.user));
        } else {
          console.log('⚠️ Žádný přihlášený uživatel');
          setUser(null);
        }
      } catch (err) {
        console.error('❌ Neočekávaná chyba při kontrole session:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Nepodařilo se načíst uživatelská data');
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth event:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Uživatel přihlášen:', session.user.id);
        setUser(mapSupabaseUser(session.user));
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Uživatel odhlášen');
        setUser(null);
      }
    });

    checkSession();

    // Cleanup
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      clearError();
      
      console.log('🔐 Pokus o přihlášení:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Chyba při přihlášení:', error.message);
        setError(`Přihlášení selhalo: ${error.message}`);
        return null;
      }
      
      if (!data.user) {
        console.error('❌ Přihlášení vrátilo prázdná data');
        setError('Přihlášení selhalo: Neplatné přihlašovací údaje');
        return null;
      }
      
      const mappedUser = mapSupabaseUser(data.user);
      console.log('✅ Přihlášení úspěšné:', mappedUser?.id);
      setUser(mappedUser);
      
      return mappedUser;
    } catch (err) {
      console.error('❌ Neočekávaná chyba při přihlášení:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Došlo k chybě při přihlašování');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (
    email: string, 
    password: string, 
    userData: { 
      name: string; 
      phone?: string; 
      address?: string; 
      bankAccount?: string 
    }
  ): Promise<User | null> => {
    try {
      setIsLoading(true);
      clearError();
      
      console.log('📝 Pokus o registraci:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login`
        }
      });
      
      if (error) {
        console.error('❌ Chyba při registraci:', error.message);
        setError(`Registrace selhala: ${error.message}`);
        return null;
      }
      
      if (!data.user) {
        console.error('❌ Registrace vrátila prázdná data');
        setError('Registrace selhala: Neznámá chyba');
        return null;
      }
      
      // Check if email confirmation is required
      if (!data.session) {
        console.log('📧 Je vyžadováno potvrzení emailu');
        setError('Registrace úspěšná! Prosím zkontrolujte svůj email pro potvrzení.');
        return null;
      }
      
      const mappedUser = mapSupabaseUser(data.user);
      console.log('✅ Registrace úspěšná:', mappedUser?.id);
      setUser(mappedUser);
      
      return mappedUser;
    } catch (err) {
      console.error('❌ Neočekávaná chyba při registraci:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Došlo k chybě při registraci');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      console.log('👋 Pokus o odhlášení');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Chyba při odhlášení:', error.message);
        setError(`Odhlášení selhalo: ${error.message}`);
        return false;
      }
      
      console.log('✅ Odhlášení úspěšné');
      setUser(null);
      
      return true;
    } catch (err) {
      console.error('❌ Neočekávaná chyba při odhlášení:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Došlo k chybě při odhlašování');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (
    userData: { 
      name?: string; 
      phone?: string; 
      address?: string; 
      bankAccount?: string 
    }
  ): Promise<User | null> => {
    try {
      setIsLoading(true);
      clearError();
      
      console.log('✏️ Pokus o aktualizaci profilu');
      
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) {
        console.error('❌ Chyba při aktualizaci profilu:', error.message);
        setError(`Aktualizace profilu selhala: ${error.message}`);
        return null;
      }
      
      if (!data.user) {
        console.error('❌ Aktualizace vrátila prázdná data');
        setError('Aktualizace profilu selhala: Neznámá chyba');
        return null;
      }
      
      const mappedUser = mapSupabaseUser(data.user);
      console.log('✅ Aktualizace profilu úspěšná');
      setUser(mappedUser);
      
      return mappedUser;
    } catch (err) {
      console.error('❌ Neočekávaná chyba při aktualizaci profilu:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Došlo k chybě při aktualizaci profilu');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  // Provide the auth context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth
export function useBetterAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useBetterAuth musí být použit uvnitř BetterAuthProvider');
  }
  
  return context;
} 