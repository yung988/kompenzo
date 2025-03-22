'use client';

import { ReactNode } from 'react';
import { useBetterAuth, AuthContextType as BetterAuthContextType } from './better-auth';

// Interface pro auth context kompatibilní se starým useAuth
export interface AuthContextType {
  currentUser: BetterAuthContextType['user'];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: BetterAuthContextType['login'];
  register: BetterAuthContextType['register'];
  logout: () => Promise<void>;
  updateProfile: BetterAuthContextType['updateProfile'];
  clearError: () => void;
}

// Hook pro použití funkcí z Better Auth s původním rozhraním
export function useAuth(): AuthContextType {
  const betterAuth = useBetterAuth();
  
  return {
    currentUser: betterAuth.user,
    isAuthenticated: !!betterAuth.user,
    isLoading: betterAuth.isLoading,
    error: betterAuth.error,
    login: betterAuth.login,
    register: betterAuth.register,
    logout: async () => {
      await betterAuth.logout();
    },
    updateProfile: betterAuth.updateProfile,
    clearError: betterAuth.clearError,
  };
} 