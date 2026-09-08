"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "error" | "warning" | "info";
interface ToastItem { id: string; type: ToastType; message: string }

interface ToastCtx { toast: (type: ToastType, message: string) => void }
const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle, error: XCircle, warning: AlertTriangle, info: CheckCircle,
};
const styles: Record<ToastType, string> = {
  success: "border-brand-500/30 bg-brand-500/10 text-brand-300",
  error:   "border-red-500/30   bg-red-500/10   text-red-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  info:    "border-blue-500/30  bg-blue-500/10  text-blue-300",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const remove = (id: string) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={clsx("flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-sm animate-slide-up", styles[t.type])}>
              <Icon size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm flex-1 leading-relaxed">{t.message}</p>
              <button onClick={() => remove(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
