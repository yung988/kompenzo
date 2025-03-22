'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Zadejte e-mailovou adresu' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setMessage({
        type: 'success',
        text: 'Pokud je účet registrován s tímto e-mailem, byl odeslán odkaz pro obnovení hesla.'
      });
    } catch (error) {
      console.error('Chyba při odesílání žádosti o obnovení hesla:', error);
      setMessage({
        type: 'error',
        text: 'Nepodařilo se odeslat odkaz pro obnovení hesla. Zkuste to prosím znovu.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-blue-800">Obnovení hesla</CardTitle>
          <CardDescription className="text-center">
            Zadejte e-mailovou adresu a my vám pošleme odkaz pro obnovení hesla
          </CardDescription>
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mailová adresa
              </label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                autoComplete="email"
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
                  Odesílání...
                </>
              ) : 'Odeslat odkaz pro obnovení'}
            </Button>
          </form>
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