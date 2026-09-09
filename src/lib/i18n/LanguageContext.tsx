"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { en, TRANSLATIONS, type TranslationKey } from "./translations";

interface LangCtx {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<LangCtx>({
  language: "English (US)",
  setLanguage: () => {},
  t: (key) => en[key] ?? key,
});

export function useLanguage() { return useContext(Ctx); }

/** Interpolate {var} placeholders in a translated string */
function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("English (US)");

  // Load from profile API on mount
  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => { if (d.profile?.language) setLanguageState(d.profile.language); })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    // Update html lang attribute for accessibility
    const dict = TRANSLATIONS[lang] ?? {};
    const isRTL = ["Arabic (العربية)", "Hebrew (עברית)", "Persian (فارسی)", "Urdu (اردو)", "ar", "he", "fa", "ur"].includes(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir  = isRTL ? "rtl" : "ltr";
  }, []);

  const t = useCallback((key: TranslationKey, vars?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] ?? {};
    const str  = (dict as any)[key] ?? en[key] ?? key;
    return interpolate(str, vars);
  }, [language]);

  return (
    <Ctx.Provider value={{ language, setLanguage, t }}>
      {children}
    </Ctx.Provider>
  );
}
