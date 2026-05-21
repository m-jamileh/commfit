"use client";
import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "../lib/utils";

export type ToastVariant = "default" | "success" | "danger" | "warning";

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-surface border-border text-text-primary",
  success: "bg-success/10 border-success/30 text-success",
  danger: "bg-danger/10 border-danger/30 text-danger",
  warning: "bg-warning/10 border-warning/30 text-warning",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-4 w-4 shrink-0" />,
  success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  danger: <AlertCircle className="h-4 w-4 shrink-0" />,
  warning: <AlertCircle className="h-4 w-4 shrink-0" />,
};

export interface ToastProps {
  id: string;
  variant?: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;
}

interface ToastItemProps extends ToastProps {
  onDismiss: (id: string) => void;
}

function ToastItem({ id, variant = "default", title, description, onDismiss }: ToastItemProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md w-[360px] max-w-[calc(100vw-2rem)]",
        "animate-in slide-in-from-bottom-4 fade-in",
        variantStyles[variant]
      )}
    >
      <span className="mt-0.5">{variantIcons[variant]}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold leading-tight">{title}</p>}
        {description && <p className="text-xs mt-0.5 opacity-80">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/40"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface ToastState {
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastState>({
  toasts: [],
  toast: () => undefined,
  dismiss: () => undefined,
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback((props: Omit<ToastProps, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = props.duration ?? 4000;
    setToasts((prev) => [...prev, { ...props, id }]);
    if (duration > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
