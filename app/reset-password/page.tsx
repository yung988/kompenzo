'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasValidLink, setHasValidLink] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Kontrola, zda je k dispozici relace pro resetování hesla
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        // Kontrola, zda uživatel přišel s hash parametrem pro resetování hesla
        if (typeof window !== 'undefined') {
          const hashParams = window.location.hash;
          if (hashParams && hashParams.includes('type=recovery')) {
            setHasValidLink(true);
          } else if (!data.session) {
            setMessage({
              type: 'error',
              text: 'Neplatný nebo vypršený odkaz pro obnovení hesla.'
            });
          } else {
            setHasValidLink(true);
          }
        }
      } catch (error) {
        console.error('Chyba při kontrole relace:', error);
        setMessage({
          type: 'error',
          text: 'Neplatný nebo vypršený odkaz pro obnovení hesla.'
        });
      } finally {
        setIsInitializing(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Hesla se neshodují' });
      return;
    }
    
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Heslo musí mít alespoň 6 znaků' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      setMessage({
        type: 'success',
        text: 'Heslo bylo úspěšně změněno. Můžete se přihlásit s novým heslem.'
      });
      
      // Přesměrování na přihlášení po 3 sekundách
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      console.error('Chyba při resetování hesla:', error);
      setMessage({
        type: 'error',
        text: 'Nepodařilo se resetovat heslo. Zkuste to prosím znovu.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
        <span className="ml-2">Kontrola odkazu pro obnovení hesla...</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="mx-auto bg-blue-100 p-2 w-12 h-12 flex items-center justify-center rounded-full mb-3">
            <Lock className="h-6 w-6 text-blue-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-blue-800">Resetování hesla</CardTitle>
          {hasValidLink ? (
            <CardDescription className="text-center">
              Zadejte nové heslo pro váš účet
            </CardDescription>
          ) : (
            <CardDescription className="text-center text-red-600">
              Odkaz pro obnovení hesla je neplatný nebo vypršel
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded text-sm ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message.text}
            </div>
          )}
          
          {hasValidLink && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Nové heslo
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  autoComplete="new-password"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Potvrďte nové heslo
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                  autoComplete="new-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ukládání...
                  </>
                ) : 'Nastavit nové heslo'}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zpět na přihlášení
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 