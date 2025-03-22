import { betterAuth } from "better-auth";

/**
 * Konfigurace Better Auth pro projekt Kompenzo
 */
export const auth = betterAuth({
  // Základní nastavení
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  // Aktivace Email + Password autentizace
  emailAndPassword: {
    enabled: true,
    // Další možnosti pro email & password
    verifyEmail: false, // Pro vývoj vypneme verifikaci emailu
  },
  
  // Integrace s databází Supabase
  adapter: {
    type: "supabase", // Použijeme adapter pro Supabase
    config: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    },
  },
  
  // Nastavení session
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dnů
  },
  
  // Nastavení vzhledu a chování
  ui: {
    logo: "/logo.png",
    theme: "light",
  },
  
  // Callbacky pro různé události
  callbacks: {
    // Vyvoláno po úspěšném přihlášení
    async signIn({ user, account }) {
      console.log("Uživatel přihlášen:", user.email);
      return true; // Povolit přihlášení
    },
    
    // Vyvoláno při vytváření session
    async session({ session, user }) {
      // Přidáme další data do session
      if (user && session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  
  // Debug mód pro vývoj
  debug: process.env.NODE_ENV === "development",
}); 