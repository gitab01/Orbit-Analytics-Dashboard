"use client";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/lib/ThemeContext";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

const OPTIONS: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: "light",  icon: Sun,     label: "Light"  },
  { value: "dark",   icon: Moon,    label: "Dark"   },
  { value: "system", icon: Monitor, label: "System" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const current = OPTIONS.find(o => o.value === theme) ?? OPTIONS[1];
  const Icon = current.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        title={`Theme: ${current.label}`}
        className="flex items-center justify-center w-9 h-9 rounded-lg border transition-colors
          bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
          text-gray-500 dark:text-gray-400
          hover:bg-gray-100 dark:hover:bg-gray-700
          hover:text-gray-800 dark:hover:text-white"
      >
        <Icon size={15} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-xl border shadow-2xl z-30 py-1 overflow-hidden
          bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          {OPTIONS.map(({ value, icon: Ic, label }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); setOpen(false); }}
              className={clsx(
                "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors",
                theme === value
                  ? "text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Ic size={14} />
              {label}
              {theme === value && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
