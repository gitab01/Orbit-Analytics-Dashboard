"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light" | "system";

interface ThemeCtx {
  theme:     Theme;
  resolved:  "dark" | "light";
  setTheme:  (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: "dark", resolved: "dark", setTheme: () => {},
});

export function useTheme() { return useContext(Ctx); }

/** Returns the current OS preference */
function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "dark" | "light") {
  const root = document.documentElement;
  root.classList.toggle("dark",  resolved === "dark");
  root.classList.toggle("light", resolved === "light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme,    setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved]   = useState<"dark" | "light">("dark");

  // Boot: read from localStorage
  useEffect(() => {
    const saved = (localStorage.getItem("orbit-theme") ?? "dark") as Theme;
    const res   = saved === "system" ? getSystemTheme() : saved;
    setThemeState(saved);
    setResolved(res);
    applyTheme(res);
  }, []);

  // React to OS changes when theme === "system"
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const res = getSystemTheme();
        setResolved(res);
        applyTheme(res);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem("orbit-theme", t);
    const res = t === "system" ? getSystemTheme() : t;
    setThemeState(t);
    setResolved(res);
    applyTheme(res);
  }, []);

  return (
    <Ctx.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </Ctx.Provider>
  );
}
