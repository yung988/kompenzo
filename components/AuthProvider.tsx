'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { authService } from '@/lib/auth-supabase';
import { useRouter, usePathname } from 'next/navigation';

// Vytvoření kontextu pro autentizaci
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, userData: { 
    name: string; 
    phone?: string; 
    address?: string; 
    bankAccount?: string 
  }) => Promise<User | null>;
  logout: () => Promise<void>;
  updateProfile: (userData: { 
    name?: string; 
    phone?: string; 
    address?: string; 
    bankAccount?: string 
  }) => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pro přístup k autentizačnímu kontextu
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth musí být použit uvnitř AuthProvider');
  }
  return context;
};

// Veřejné cesty, které nevyžadují přihlášení
const publicPaths = ['/', '/login', '/register'];

// Provider komponenta
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Kontrola přihlášení při načtení stránky
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        // Přesměrování, pokud je uživatel na chráněné cestě a není přihlášen
        if (!currentUser && !publicPaths.includes(pathname)) {
          router.push('/login');
        }
        
        // Přesměrování, pokud je uživatel přihlášen a je na login/register stránce
        if (currentUser && (pathname === '/login' || pathname === '/register')) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Chyba při kontrole přihlášení:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [pathname, router]);

  // Přihlášení
  const login = async (email: string, password: string) => {
    try {
      const loggedUser = await authService.login(email, password);
      if (loggedUser) {
        setUser(loggedUser);
      }
      return loggedUser;
    } catch (error) {
      console.error('Chyba při přihlašování:', error);
      return null;
    }
  };

  // Registrace
  const register = async (
    email: string, 
    password: string, 
    userData: { 
      name: string; 
      phone?: string; 
      address?: string; 
      bankAccount?: string 
    }
  ) => {
    try {
      const newUser = await authService.register(email, password, userData);
      if (newUser) {
        setUser(newUser);
      }
      return newUser;
    } catch (error) {
      console.error('Chyba při registraci:', error);
      return null;
    }
  };

  // Odhlášení
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Chyba při odhlašování:', error);
    }
  };

  // Aktualizace profilu
  const updateProfile = async (userData: { 
    name?: string; 
    phone?: string; 
    address?: string; 
    bankAccount?: string 
  }) => {
    try {
      const updatedUser = await authService.updateUserProfile(userData);
      if (updatedUser) {
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (error) {
      console.error('Chyba při aktualizaci profilu:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 