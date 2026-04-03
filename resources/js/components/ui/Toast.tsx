import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; type: ToastType; title: string; message?: string; }
interface ToastContextType { toast: (type: ToastType, title: string, message?: string) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const colors = {
  success: { bg: '#f0fdf4', border: '#86efac', icon: '#22c55e', title: '#166534' },
  error:   { bg: '#fef2f2', border: '#fca5a5', icon: '#ef4444', title: '#991b1b' },
  warning: { bg: '#fffbeb', border: '#fcd34d', icon: '#f59e0b', title: '#92400e' },
  info:    { bg: '#eff6ff', border: '#93c5fd', icon: '#3b82f6', title: '#1e40af' },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380 }}>
        {toasts.map(t => {
          const Icon = icons[t.type];
          const c = colors[t.type];
          return (
            <div key={t.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: '0 8px 32px rgba(0,0,0,.12)', animation: 'slideInToast .35s cubic-bezier(.16,1,.3,1)' }}>
              <Icon style={{ color: c.icon, width: 20, height: 20, flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: c.title, margin: 0 }}>{t.title}</p>
                {t.message && <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0', lineHeight: 1.5 }}>{t.message}</p>}
              </div>
              <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, flexShrink: 0 }}><X size={14} /></button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideInToast{from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);}}`}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
