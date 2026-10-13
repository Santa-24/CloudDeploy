import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  const success = (title: string, message?: string) => addToast('success', title, message);
  const error = (title: string, message?: string) => addToast('error', title, message);
  const info = (title: string, message?: string) => addToast('info', title, message);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 md:px-0">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-paper-light border-2 border-ink shadow-[4px_4px_0px_0px_#1D1C19] transition-all duration-200 animate-in slide-in-from-bottom-2 ${
              t.type === 'error' ? 'border-red-700 bg-red-50' : t.type === 'success' ? 'border-green-700 bg-green-50' : ''
            }`}
            role="alert"
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-700" />
              ) : t.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-700" />
              ) : (
                <Info className="w-5 h-5 text-ink" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-semibold text-ink font-sans">{t.title}</h4>
              {t.message && <p className="text-xs text-ink-muted mt-0.5">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-ink-faint hover:text-ink p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
