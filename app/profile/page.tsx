'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useBetterAuth } from '@/lib/better-auth'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, error, updateProfile, clearError, logout } = useBetterAuth()
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Načtení dat uživatele
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setAddress(user.address || '')
      setBankAccount(user.bankAccount || '')
    }
  }, [user])
  
  // Přesměrování, pokud není uživatel přihlášen
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')
    clearError()
    
    try {
      setIsSaving(true)
      
      const userData = {
        name,
        phone: phone || undefined,
        address: address || undefined,
        bankAccount: bankAccount || undefined
      }
      
      const updatedUser = await updateProfile(userData)
      
      if (updatedUser) {
        setSuccessMessage('Profil byl úspěšně aktualizován')
        console.log('✅ Profil úspěšně aktualizován')
      }
    } catch (err) {
      console.error('❌ Aktualizace profilu selhala:', err)
      setFormError('Aktualizace profilu selhala. Zkuste to znovu.')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
  
  if (isLoading) {
    return (
      <div className="container max-w-md py-8 mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-md w-1/2 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container max-w-md py-8 mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Váš profil</CardTitle>
          <CardDescription className="text-center">
            Aktualizujte své osobní údaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(formError || error) && (
              <div className="p-3 rounded-md bg-red-50 text-red-600">
                {formError || error}
              </div>
            )}
            
            {successMessage && (
              <div className="p-3 rounded-md bg-green-50 text-green-600">
                {successMessage}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">E-mail nelze změnit</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Jméno a příjmení</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jan Novák"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+420 123 456 789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresa</Label>
              <Input
                id="address"
                type="text"
                placeholder="Dlouhá 123, Praha 1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Číslo účtu</Label>
              <Input
                id="bankAccount"
                type="text"
                placeholder="000000-0000000000/0000"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSaving}
            >
              {isSaving ? 'Ukládám...' : 'Uložit změny'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center flex-col space-y-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleLogout}
          >
            Odhlásit se
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

