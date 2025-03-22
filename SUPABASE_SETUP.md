# Inicializace databáze na Supabase

Tento návod vás provede procesem vytvoření projektu na Supabase a inicializace potřebné databázové struktury pro aplikaci Kompenzo.

## 1. Vytvoření projektu

1. Přihlaste se do svého účtu na [Supabase](https://supabase.com)
2. Klikněte na tlačítko "New Project"
3. Zadejte název projektu (např. "Kompenzo")
4. Zadejte heslo pro databázi (bezpečně si ho uložte)
5. Vyberte region, který je nejblíže vašim uživatelům (např. "West Europe")
6. Klikněte na "Create new project"

## 2. Inicializace databáze

Po vytvoření projektu můžete inicializovat databázi pomocí SQL editoru:

1. V levém menu přejděte na "SQL Editor"
2. Klikněte na "New query"
3. Zkopírujte celý obsah souboru `supabase-init.sql` z tohoto repozitáře do editoru
4. Klikněte na "Run" pro spuštění SQL skriptu

Skript vytvoří následující strukturu:
- Tabulku `profiles` pro ukládání informací o uživatelích
- Tabulku `tickets` pro ukládání jízdenek
- Tabulku `refund_claims` pro ukládání refundačních nároků
- Bezpečnostní politiky pro kontrolu přístupu k datům (Row Level Security)
- Triggery pro automatickou aktualizaci polí `updated_at`
- Trigger pro automatické vytvoření profilu při registraci uživatele

## 3. Nastavení autentizace

Pro správné fungování autentizace je třeba provést následující kroky:

1. V levém menu přejděte na "Authentication" > "Providers"
2. Povolte "Email" metodu a nastavte podle potřeby:
   - Vypněte "Confirm email" pro jednodušší testování
   - Nastavte "Secure email template" podle potřeby
3. Pro produkční nasazení doporučujeme zapnout dvoufaktorové ověřování

## 4. Získání přístupových údajů

Pro připojení aplikace k Supabase potřebujete:

1. V levém menu přejděte na "Project Settings" > "API"
2. Zkopírujte "Project URL" - to je hodnota pro `NEXT_PUBLIC_SUPABASE_URL`
3. Zkopírujte "anon public" klíč - to je hodnota pro `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Nastavení proměnných prostředí

1. Ve vaší lokální kopii projektu vytvořte soubor `.env.local` s následujícím obsahem:
   ```
   NEXT_PUBLIC_SUPABASE_URL=vaše_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=váš_anon_public_klíč
   ```

2. Pro produkční nasazení na Vercel nastavte tyto proměnné prostředí v dashboardu projektu:
   - Přejděte na váš projekt na Vercel
   - Přejděte na "Settings" > "Environment Variables"
   - Přidejte proměnné `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY` s hodnotami z kroku 4

## 6. Testování spojení

Pro ověření, že vaše aplikace se správně připojuje k Supabase databázi:

1. Spusťte aplikaci lokálně pomocí `pnpm dev`
2. Zkuste se zaregistrovat a přihlásit
3. Zkontrolujte v Supabase dashboardu, zda se vytvořily záznamy v tabulce `auth.users` a `public.profiles` 