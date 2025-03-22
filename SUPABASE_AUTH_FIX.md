# Řešení problémů s autentizací na Supabase

Pokud nefunguje registrace a přihlášení na lokálním prostředí (localhost:3000), přestože máte správně nastavenou databázi a vytvořené uživatele v Supabase, zkuste následující kroky:

## 1. Zkontrolujte nastavení autentizace v Supabase

1. Přihlaste se do svého Supabase dashboardu
2. Přejděte do sekce **Authentication** > **Providers**
3. Ujistěte se, že je povolena metoda **Email** (je zapnutá)
4. Zkontrolujte nastavení **Email provider**:
   - Pro vývoj může být užitečné vypnout "Confirm email" (ověření emailu)
   - Nastavte "Secure email template" podle potřeby

## 2. Nastavení URL pro přesměrování

1. V Supabase dashboardu přejděte do **Authentication** > **URL Configuration**
2. Nastavte **Site URL** na `http://localhost:3000`
3. Přidejte do **Redirect URLs** následující URL:
   - `http://localhost:3000`
   - `http://localhost:3000/login`
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/profile`

## 3. CORS nastavení

1. Přejděte do **API** > **Settings** > **CORS**
2. Přidejte `http://localhost:3000` do seznamu povolených origin URL

## 4. Zkontrolujte proměnné prostředí v lokálním prostředí

Ujistěte se, že soubor `.env.local` obsahuje správné hodnoty pro:
```
NEXT_PUBLIC_SUPABASE_URL=vaše_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=váš_anon_public_klíč
```

## 5. Kontrola localStorage a cookies

1. Otevřete vývojářské nástroje prohlížeče (F12 nebo Pravé tlačítko > Prozkoumat)
2. Přejděte na záložku **Application** > **Storage** > **Local Storage**
3. Vymažte všechny položky související s Supabase (pokud existují)
4. Zkuste se znovu přihlásit/registrovat

## 6. Kontrola konzole na chyby

1. V prohlížeči otevřete vývojářské nástroje (F12)
2. Přejděte na záložku **Console**
3. Zkuste se přihlásit nebo registrovat a sledujte, zda se nezobrazí nějaké chyby

## 7. Zapnutí logování v Supabase klientovi

Upravte soubor `lib/supabase.ts` pro zobrazení detailních informací o problémech:

```typescript
// V prohlížeči
supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'kompenzo-auth',
  }
});
```

## 8. Kontrola Row Level Security (RLS) politik

1. V Supabase dashboardu přejděte do **Table Editor** > **profiles**
2. Zkontrolujte, zda jsou správně nastavené RLS politiky (Row Level Security)
3. Pro testování můžete dočasně vypnout RLS na tabulce profiles pro ověření, zda je to příčina problému 