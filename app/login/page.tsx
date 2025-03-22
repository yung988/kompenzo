'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useBetterAuth } from '@/lib/better-auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, isLoading, clearError } = useBetterAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();
    
    // Validace vstupu
    if (!email) {
      setFormError('Zadejte e-mail');
      return;
    }
    
    if (!password) {
      setFormError('Zadejte heslo');
      return;
    }
    
    try {
      const user = await login(email, password);
      if (user) {
        console.log('✅ Login successful, navigating to dashboard');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('❌ Login failed:', err);
      setFormError('Přihlášení selhalo. Zkuste to znovu.');
    }
  };
  
  return (
    <div className="container max-w-md py-8 mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Přihlášení</CardTitle>
          <CardDescription className="text-center">
            Vítejte zpět! Přihlaste se ke svému účtu.
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
              <div className="flex justify-between">
                <Label htmlFor="password">Heslo</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Zapomenuté heslo?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Přihlašuji...' : 'Přihlásit se'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center flex-col space-y-4">
          <div className="text-sm text-center">
            Ještě nemáte účet?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Zaregistrujte se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 