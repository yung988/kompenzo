-- Vytvoření tabulky pro uživatele (rozšíření auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Vytvoření bezpečnostních politik pro tabulku profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profily jsou dostupné pouze pro vlastníky" 
  ON public.profiles 
  FOR ALL 
  USING (auth.uid() = id);

-- Vytvoření tabulky pro jízdenky
CREATE TABLE public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('paper', 'digital')) NOT NULL,
  transport_type TEXT CHECK (transport_type IN ('train', 'bus')) NOT NULL,
  carrier TEXT NOT NULL,
  route_number TEXT,
  departure_station TEXT NOT NULL,
  arrival_station TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_date DATE NOT NULL,
  arrival_time TIME NOT NULL,
  status TEXT CHECK (status IN ('active', 'used', 'expired', 'refunding', 'refunded')) NOT NULL,
  delay_minutes INTEGER DEFAULT 0,
  price INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Vytvoření bezpečnostních politik pro tabulku tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jízdenky jsou dostupné pouze pro vlastníky" 
  ON public.tickets 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Vytvoření tabulky pro refundační nároky
CREATE TABLE public.refund_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'paid')) NOT NULL DEFAULT 'pending',
  reason TEXT NOT NULL,
  bank_account TEXT,
  iban TEXT,
  swift TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Vytvoření bezpečnostních politik pro tabulku refund_claims
ALTER TABLE public.refund_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Refundační nároky jsou dostupné pouze pro vlastníky" 
  ON public.refund_claims 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Vytvoření funkce pro aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vytvoření triggerů pro aktualizaci updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_refund_claims_updated_at
BEFORE UPDATE ON public.refund_claims
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Automatické vytvoření záznamu v profiles při registraci uživatele
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 