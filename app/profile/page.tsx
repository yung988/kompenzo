'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, User, Mail, Phone, Home, CreditCard, ShieldCheck, AlertTriangle } from 'lucide-react'

// Schéma validace formuláře
const profileSchema = z.object({
  name: z.string().min(3, 'Jméno musí mít alespoň 3 znaky'),
  email: z.string().email('Neplatný formát e-mailu'),
  phone: z.string().optional(),
  address: z.string().optional(),
  bankAccount: z.string().optional()
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Zadejte současné heslo'),
  newPassword: z.string().min(8, 'Nové heslo musí mít alespoň 8 znaků'),
  confirmPassword: z.string().min(8, 'Potvrzení hesla musí mít alespoň 8 znaků')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword']
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const router = useRouter()
  const { currentUser, isAuthenticated, updateUserProfile, changePassword } = useAuth()
  
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    bankAccount: ''
  })
  
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (currentUser) {
      setProfileFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        bankAccount: currentUser.bankAccount || ''
      })
    }
  }, [currentUser, isAuthenticated, router])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileFormData(prev => ({ ...prev, [name]: value }))
    
    // Vyčištění chyby pro toto pole
    if (profileErrors[name]) {
      setProfileErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordFormData(prev => ({ ...prev, [name]: value }))
    
    // Vyčištění chyby pro toto pole
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validace formuláře
      const validatedData = profileSchema.parse(profileFormData)
      setProfileErrors({})
      
      setIsSubmittingProfile(true)
      setProfileMessage(null)
      
      const success = await updateUserProfile({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        bankAccount: validatedData.bankAccount
      })
      
      if (success) {
        setProfileMessage({
          type: 'success',
          text: 'Profil byl úspěšně aktualizován.'
        })
      } else {
        setProfileMessage({
          type: 'error',
          text: 'Nepodařilo se aktualizovat profil. Zkuste to prosím znovu.'
        })
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Zpracování validačních chyb
        const fieldErrors: Record<string, string> = {}
        err.errors.forEach(error => {
          if (error.path) {
            fieldErrors[error.path[0]] = error.message
          }
        })
        setProfileErrors(fieldErrors)
      } else {
        console.error('Chyba při odesílání formuláře:', err)
        setProfileMessage({
          type: 'error',
          text: 'Došlo k chybě při zpracování požadavku. Zkuste to prosím znovu.'
        })
      }
    } finally {
      setIsSubmittingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validace formuláře
      const validatedData = passwordSchema.parse(passwordFormData)
      setPasswordErrors({})
      
      setIsSubmittingPassword(true)
      setPasswordMessage(null)
      
      const success = await changePassword(
        validatedData.currentPassword,
        validatedData.newPassword
      )
      
      if (success) {
        setPasswordMessage({
          type: 'success',
          text: 'Heslo bylo úspěšně změněno.'
        })
        
        // Vyčištění formuláře
        setPasswordFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setPasswordMessage({
          type: 'error',
          text: 'Nepodařilo se změnit heslo. Ujistěte se, že současné heslo je správné.'
        })
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Zpracování validačních chyb
        const fieldErrors: Record<string, string> = {}
        err.errors.forEach(error => {
          if (error.path) {
            fieldErrors[error.path[0]] = error.message
          }
        })
        setPasswordErrors(fieldErrors)
      } else {
        console.error('Chyba při odesílání formuláře:', err)
        setPasswordMessage({
          type: 'error',
          text: 'Došlo k chybě při zpracování požadavku. Zkuste to prosím znovu.'
        })
      }
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2 text-center text-blue-800">Můj profil</h1>
      <p className="text-center text-gray-600 mb-6">
        Zde můžete spravovat své osobní údaje a nastavení účtu
      </p>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Osobní údaje</TabsTrigger>
          <TabsTrigger value="security">Zabezpečení</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Osobní údaje</CardTitle>
              <CardDescription>
                Aktualizujte své kontaktní údaje a informace pro výplatu odškodného
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileMessage && (
                <div className={`border px-4 py-3 rounded mb-4 ${
                  profileMessage.type === 'success' 
                    ? 'bg-green-100 border-green-400 text-green-700' 
                    : 'bg-red-100 border-red-400 text-red-700'
                }`}>
                  {profileMessage.text}
                </div>
              )}
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="name">Jméno a příjmení</Label>
                  </div>
                  <Input 
                    id="name" 
                    name="name" 
                    value={profileFormData.name} 
                    onChange={handleProfileChange} 
                    className={profileErrors.name ? "border-red-500" : ""}
                  />
                  {profileErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="email">E-mail</Label>
                  </div>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={profileFormData.email} 
                    onChange={handleProfileChange} 
                    className={profileErrors.email ? "border-red-500" : ""}
                  />
                  {profileErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="phone">Telefon</Label>
                  </div>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    value={profileFormData.phone || ''} 
                    onChange={handleProfileChange} 
                    placeholder="Nepovinné"
                    className={profileErrors.phone ? "border-red-500" : ""}
                  />
                  {profileErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{profileErrors.phone}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="address">Adresa</Label>
                  </div>
                  <Textarea 
                    id="address" 
                    name="address" 
                    value={profileFormData.address || ''} 
                    onChange={handleProfileChange} 
                    placeholder="Nepovinné"
                    className={profileErrors.address ? "border-red-500" : ""}
                  />
                  {profileErrors.address && (
                    <p className="text-red-500 text-xs mt-1">{profileErrors.address}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="bankAccount">Bankovní účet</Label>
                  </div>
                  <Input 
                    id="bankAccount" 
                    name="bankAccount" 
                    value={profileFormData.bankAccount || ''} 
                    onChange={handleProfileChange} 
                    placeholder="Např. 123456789/0800"
                    className={profileErrors.bankAccount ? "border-red-500" : ""}
                  />
                  {profileErrors.bankAccount && (
                    <p className="text-red-500 text-xs mt-1">{profileErrors.bankAccount}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Váš bankovní účet pro výplatu odškodného
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmittingProfile}
                >
                  {isSubmittingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ukládání...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Uložit změny
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Zabezpečení</CardTitle>
              <CardDescription>
                Změňte své heslo a spravujte nastavení zabezpečení
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordMessage && (
                <div className={`border px-4 py-3 rounded mb-4 ${
                  passwordMessage.type === 'success' 
                    ? 'bg-green-100 border-green-400 text-green-700' 
                    : 'bg-red-100 border-red-400 text-red-700'
                }`}>
                  {passwordMessage.text}
                </div>
              )}
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Současné heslo</Label>
                  <Input 
                    id="currentPassword" 
                    name="currentPassword" 
                    type="password" 
                    value={passwordFormData.currentPassword} 
                    onChange={handlePasswordChange} 
                    className={passwordErrors.currentPassword ? "border-red-500" : ""}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Nové heslo</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword" 
                    type="password" 
                    value={passwordFormData.newPassword} 
                    onChange={handlePasswordChange} 
                    className={passwordErrors.newPassword ? "border-red-500" : ""}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Potvrzení nového hesla</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    value={passwordFormData.confirmPassword} 
                    onChange={handlePasswordChange} 
                    className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                
                <div className="bg-blue-50 p-3 rounded text-sm flex gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Tipy pro silné heslo:</p>
                    <ul className="text-xs text-blue-700 list-disc pl-4 mt-1 space-y-1">
                      <li>Použijte alespoň 8 znaků</li>
                      <li>Kombinujte velká a malá písmena</li>
                      <li>Přidejte číslice a speciální znaky</li>
                      <li>Nepoužívejte osobní údaje nebo běžná slova</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmittingPassword}
                >
                  {isSubmittingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Změna hesla...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Změnit heslo
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Nebezpečné akce
                </h3>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => {
                    if (confirm("Opravdu chcete smazat svůj účet? Tato akce je nevratná.")) {
                      // handleAccountDeletion()
                      alert("Tato funkce ještě není implementována.")
                    }
                  }}
                >
                  Smazat účet
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Smazáním účtu ztratíte přístup ke všem svým datům a žádostem o odškodnění.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

