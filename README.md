# Kompenzo

Aplikace pro správu jízdenek a automatické sledování zpoždění pro účely odškodnění.

## Funkce

- **Správa jízdenek** - Přidání, úprava a odstranění jízdenek
- **Sledování zpoždění** - Automatická kontrola zpoždění pro vaše jízdenky
- **Žádosti o odškodnění** - Vytváření a správa žádostí o odškodnění za zpožděné spoje
- **Napojení na ČD API** - Vyhledávání spojení a automatické sledování zpoždění vlaků

## Napojení na API Českých drah

Aplikace je integrována s [API Českých drah](https://ticket-api.cd.cz/), které umožňuje:

1. **Vyhledávání spojení**
   - Vyhledání stanice podle názvu
   - Vyhledání spojení mezi stanicemi
   - Zjištění ceny, času odjezdu a příjezdu

2. **Automatické sledování zpoždění**
   - Periodická kontrola zpoždění vašich aktivních jízdenek
   - Automatické vytvoření žádosti o odškodnění při zpoždění větším než 60 minut

## Jak to funguje

1. **Přidání jízdenky**
   - Můžete ručně zadat informace o jízdence
   - Nebo využít vyhledávání spojení, které automaticky předvyplní údaje

2. **Automatické sledování**
   - Po přihlášení aplikace periodicky kontroluje zpoždění vašich aktivních jízdenek
   - Při detekci zpoždění nad limit pro odškodnění (60+ minut) vytvoří automaticky žádost

3. **Žádosti o odškodnění**
   - Zobrazení všech vytvořených žádostí
   - Sledování stavu žádostí

## Technologie

- Next.js 14
- React
- TypeScript
- TailwindCSS
- Shadcn/UI
- Supabase

## Začínáme

### Prerekvizity

- Node.js 18+ 
- pnpm

### Instalace

1. Naklonujte repozitář
   ```bash
   git clone https://github.com/yung988/kompenzo.git
   cd kompenzo
   ```

2. Nainstalujte závislosti
   ```bash
   pnpm install
   ```

3. Vytvořte Supabase projekt

   - Zaregistrujte se na [Supabase](https://supabase.com/)
   - Vytvořte nový projekt
   - Vytvořte následující tabulky v Supabase:
     - tickets
     - claims
   - Povolte autentizaci přes email/heslo

4. Vytvořte soubor `.env.local` a přidejte své Supabase údaje:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Spusťte vývojový server
   ```bash
   pnpm dev
   ```

6. Otevřete [http://localhost:3000](http://localhost:3000) ve svém prohlížeči

## Struktura databáze Supabase

### Tabulka `tickets`

| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | uuid | Primární klíč |
| userId | uuid | ID uživatele |
| type | varchar | 'digital' nebo 'scanned' |
| transportType | varchar | 'train' nebo 'bus' |
| carrier | varchar | 'cd', 'regiojet', 'flixbus', 'other' |
| routeNumber | varchar | Číslo spoje |
| departureStation | varchar | Výchozí stanice |
| arrivalStation | varchar | Cílová stanice |
| departureDate | varchar | Datum odjezdu |
| departureTime | varchar | Čas odjezdu |
| arrivalDate | varchar | Datum příjezdu |
| arrivalTime | varchar | Čas příjezdu |
| status | varchar | 'active', 'used', 'expired' |
| delayMinutes | integer | Zpoždění v minutách |
| price | integer | Cena jízdenky v Kč |
| imageUrl | varchar | URL naskenované jízdenky |
| created | timestamp | Datum vytvoření záznamu |

### Tabulka `claims`

| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | uuid | Primární klíč |
| ticketId | uuid | ID jízdenky |
| userId | uuid | ID uživatele |
| status | varchar | 'pending', 'approved', 'rejected', 'paid' |
| amount | integer | Částka refundace v Kč |
| submissionDate | timestamp | Datum podání žádosti |
| resolutionDate | timestamp | Datum vyřízení žádosti |
| carrier | varchar | 'cd', 'regiojet', 'flixbus', 'other' |
| bankAccount | varchar | Bankovní účet pro výplatu |
| notes | text | Poznámky k žádosti |

## Nasazení na Vercel

1. Zaregistrujte se na [Vercel](https://vercel.com/)
2. Nasaďte aplikaci kliknutím na tlačítko níže:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyung988%2Fkompenzo)

3. Nastavte proměnné prostředí:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Licence

Tento projekt je licencován pod MIT licencí - viz soubor LICENSE pro detaily.
