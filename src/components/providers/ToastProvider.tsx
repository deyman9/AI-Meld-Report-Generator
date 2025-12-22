"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Toast, { ToastVariant } from "@/components/ui/Toast";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((options: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastItem = { ...options, id };
    
    setToasts((prev) => {
      // Limit to 5 toasts max
      const updated = [...prev, newToast];
      if (updated.length > 5) {
        return updated.slice(-5);
      }
      return updated;
    });

    return id;
  }, []);

  const success = useCallback((title: string, message?: string) => {
    toast({ variant: "success", title, message });
  }, [toast]);

  const error = useCallback((title: string, message?: string) => {
    toast({ variant: "error", title, message, duration: 8000 }); // Errors stay longer
  }, [toast]);

  const warning = useCallback((title: string, message?: string) => {
    toast({ variant: "warning", title, message, duration: 6000 });
  }, [toast]);

  const info = useCallback((title: string, message?: string) => {
    toast({ variant: "info", title, message });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss, dismissAll }}>
      {children}
      
      {/* Toast Container */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              id={t.id}
              variant={t.variant}
              title={t.title}
              message={t.message}
              duration={t.duration}
              onDismiss={dismiss}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

