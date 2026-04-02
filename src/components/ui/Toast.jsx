import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import useUIStore from '../../store/ui';

import { toastListeners } from '../../utils/toast';

// ─── Icon + Color Map ──────────────────────────────────────────
const config = {
  success: {
    icon: CheckCircle,
    dark:  'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    light: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    dark:  'bg-red-500/10 border-red-500/30 text-red-400',
    light: 'bg-red-50 border-red-200 text-red-700',
    bar: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    dark:  'bg-amber-500/10 border-amber-500/30 text-amber-400',
    light: 'bg-amber-50 border-amber-200 text-amber-700',
    bar: 'bg-amber-500',
  },
  info: {
    icon: Info,
    dark:  'bg-blue-500/10 border-blue-500/30 text-blue-400',
    light: 'bg-blue-50 border-blue-200 text-blue-700',
    bar: 'bg-blue-500',
  },
};

// ─── Single Toast Item ─────────────────────────────────────────
function ToastItem({ t, onRemove }) {
  const { isDarkMode } = useUIStore();
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const cfg = config[t.type] || config.info;
  const Icon = cfg.icon;

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(t.id), 300);
  }, [t.id, onRemove]);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / t.duration) * 100);
      setProgress(pct);
      if (pct <= 0) { clearInterval(interval); handleClose(); }
    }, 30);
    return () => clearInterval(interval);
  }, [t.duration, handleClose]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm overflow-hidden transition-all duration-300 min-w-[320px] max-w-[420px]
        ${isDarkMode ? cfg.dark : cfg.light}
        ${exiting ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100'}
      `}
      style={{ animation: exiting ? 'none' : 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm font-semibold flex-1 leading-snug">{t.message}</p>
      <button onClick={handleClose} className="p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/10">
        <div className={`h-full ${cfg.bar} transition-all duration-100 ease-linear rounded-full`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// ─── Toast Container (render once at App root) ─────────────────
export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => { toastListeners = toastListeners.filter(fn => fn !== setToasts); };
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {toasts.map(t => (
        <ToastItem key={t.id} t={t} onRemove={remove} />
      ))}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
