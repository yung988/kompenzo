'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from './types'
import { userService } from './api-supabase'
import { delayMonitorService } from './services/delay-monitor'

// Mockovaní uživatelé
const MOCK_USERS: User[] = [
  {
    id: 'user1',
    email: 'jan.novak@example.com',
    name: 'Jan Novák',
    phone: '+420 777 123 456',
    bankAccount: '2300123456/2010'
  }
];

// Definice kontextu autentizace
type AuthContextType = {
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<boolean>
  updateUser: (data: Partial<User>) => Promise<User | null>;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean
}

// Vytvoření kontextu s výchozími hodnotami
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  updateUser: async () => null,
  updateUserProfile: async () => false,
  changePassword: async () => false,
  isLoading: true
})

// Hook pro použití kontextu
export const useAuth = () => useContext(AuthContext)

// Provider komponenta pro autentizaci
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [monitoringId, setMonitoringId] = useState<NodeJS.Timeout | null>(null)

  // Načtení uživatele z localStorage při startu aplikace
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as User
          setCurrentUser(user)
          setIsAuthenticated(true)
          
          // Spustíme monitoring zpoždění pro přihlášeného uživatele
          const intervalId = delayMonitorService.scheduleMonitoring(user.id, 30)
          setMonitoringId(intervalId)
        } catch (error) {
          console.error('Chyba při načítání uživatele z localStorage:', error)
          localStorage.removeItem('currentUser')
        }
      }
      setIsLoading(false)
    }
    
    loadUser()
  }, [])

  // Funkce pro přihlášení
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const user = await userService.login(email, password)
      if (user) {
        setCurrentUser(user)
        setIsAuthenticated(true)
        localStorage.setItem('currentUser', JSON.stringify(user))
        
        // Spustíme monitoring zpoždění po přihlášení
        const intervalId = delayMonitorService.scheduleMonitoring(user.id, 30)
        setMonitoringId(intervalId)
        
        return true
      }
      return false
    } catch (error) {
      console.error('Chyba při přihlašování:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Funkce pro odhlášení
  const logout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('currentUser')
    
    // Zastavíme monitoring zpoždění při odhlášení
    if (monitoringId) {
      delayMonitorService.stopMonitoring(monitoringId)
      setMonitoringId(null)
    }
  }

  // Funkce pro registraci
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const user = await userService.register(name, email, password)
      if (user) {
        setCurrentUser(user)
        setIsAuthenticated(true)
        localStorage.setItem('currentUser', JSON.stringify(user))
        return true
      }
      return false
    } catch (error) {
      console.error('Chyba při registraci:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Funkce pro aktualizaci uživatele
  const updateUser = async (data: Partial<User>): Promise<User | null> => {
    if (!currentUser) return null
    
    try {
      const updatedUser = await userService.update(currentUser.id, data)
      if (updatedUser) {
        setCurrentUser(updatedUser)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
        return updatedUser
      }
      return null
    } catch (error) {
      console.error('Chyba při aktualizaci uživatele:', error)
      return null
    }
  }

  // Funkce pro aktualizaci profilu
  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    const updatedUser = await updateUser(data)
    return !!updatedUser
  }

  // Funkce pro změnu hesla
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser) return false
    
    try {
      return await userService.changePassword(currentUser.id, currentPassword, newPassword)
    } catch (error) {
      console.error('Chyba při změně hesla:', error)
      return false
    }
  }

  // Sestavení hodnot kontextu
  const contextValue: AuthContextType = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    register,
    updateUser,
    updateUserProfile,
    changePassword,
    isLoading
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
} 