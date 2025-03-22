'use client';

import { useBetterAuth } from '@/lib/better-auth';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, LogOut, Settings } from 'lucide-react';

export function UserMenu() {
  const { user, logout, isLoading } = useBetterAuth();

  // Pokud se načítají data, zobrazíme prázdnou šablonu
  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  // Pokud není uživatel přihlášen, zobrazíme tlačítka pro přihlášení/registraci
  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/login">Přihlásit se</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Registrovat</Link>
        </Button>
      </div>
    );
  }

  // Pro přihlášeného uživatele zobrazíme dropdown menu
  const handleLogout = async () => {
    await logout();
  };

  // Získání iniciál uživatele pro avatar
  const getInitials = () => {
    if (!user.name) return 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.name || user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Přehled</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Odhlásit se</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 