// src/context/LangContext.tsx
// Provides Arabic/English language toggle.
// Sets document.documentElement.dir = 'rtl' | 'ltr' and persists to localStorage.

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import translations, { type Lang, type LangKey } from "../i18n";

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: LangKey) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem("thimar_lang");
    return stored === "ar" ? "ar" : "en";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.lang = lang;
    localStorage.setItem("thimar_lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  const t = (key: LangKey): string =>
    translations[lang][key] ?? translations.en[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
