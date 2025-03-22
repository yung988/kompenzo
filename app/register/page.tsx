'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useBetterAuth } from '@/lib/better-auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, isLoading, clearError } = useBetterAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();
    
    // Validace vstupu
    if (!name) {
      setFormError('Zadejte své jméno');
      return;
    }
    
    if (!email) {
      setFormError('Zadejte e-mail');
      return;
    }
    
    if (!password) {
      setFormError('Zadejte heslo');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Heslo musí mít alespoň 6 znaků');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Hesla se neshodují');
      return;
    }
    
    try {
      const userData = {
        name,
        phone: phone || undefined
      };
      
      const user = await register(email, password, userData);
      
      if (user) {
        console.log('✅ Registrace úspěšná, přesměrování na dashboard');
        router.push('/dashboard');
      } else {
        // Pokud `register` vrátí null, ale není vyhozena chyba,
        // pravděpodobně je potřeba potvrdit e-mail
        setSuccess(true);
      }
    } catch (err) {
      console.error('❌ Registrace selhala:', err);
      setFormError('Registrace selhala. Zkuste to znovu.');
    }
  };
  
  if (success) {
    return (
      <div className="container max-w-md py-8 mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Registrace úspěšná!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Děkujeme za registraci. Na váš e-mail byla odeslána potvrzovací zpráva.</p>
            <p>Klikněte na odkaz v e-mailu pro aktivaci vašeho účtu.</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/login">Přejít na přihlášení</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-md py-8 mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Registrace</CardTitle>
          <CardDescription className="text-center">
            Vytvořte si účet pro správu vašich refundací
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(formError || error) && (
              <div className="p-3 rounded-md bg-red-50 text-red-600">
                {formError || error}
              </div>
            )}
            
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
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (nepovinné)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+420 123 456 789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Registruji...' : 'Registrovat se'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-center">
            Už máte účet?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Přihlaste se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 