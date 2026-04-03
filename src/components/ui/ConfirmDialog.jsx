import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X, HelpCircle } from 'lucide-react';
import useUIStore from '../../store/ui';

import { getConfirmResolver, setConfirmResolver, setSetConfirmStateFn } from '../../utils/confirm';

// ─── Icon + Color Config ───────────────────────────────────────
const typeConfig = {
  warning: {
    icon: AlertTriangle,
    darkBg: 'bg-amber-500/10',
    darkText: 'text-amber-400',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-600',
    btnClass: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
  },
  danger: {
    icon: XCircle,
    darkBg: 'bg-red-500/10',
    darkText: 'text-red-400',
    lightBg: 'bg-red-50',
    lightText: 'text-red-600',
    btnClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
  },
  success: {
    icon: CheckCircle,
    darkBg: 'bg-emerald-500/10',
    darkText: 'text-emerald-400',
    lightBg: 'bg-emerald-50',
    lightText: 'text-emerald-600',
    btnClass: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20',
  },
  info: {
    icon: Info,
    darkBg: 'bg-blue-500/10',
    darkText: 'text-blue-400',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
    btnClass: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20',
  },
  question: {
    icon: HelpCircle,
    darkBg: 'bg-indigo-500/10',
    darkText: 'text-indigo-400',
    lightBg: 'bg-indigo-50',
    lightText: 'text-indigo-600',
    btnClass: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20',
  },
};

// ─── Confirm Dialog Component ──────────────────────────────────
export default function ConfirmDialog() {
  const { isDarkMode } = useUIStore();
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    showInput: false,
    inputPlaceholder: '',
    inputRequired: false,
    inputValue: '',
  });

  useEffect(() => {
    setSetConfirmStateFn(setState);
    return () => { setSetConfirmStateFn(null); };
  }, []);

  const handleConfirm = () => {
    if (state.inputRequired && !state.inputValue.trim()) return;
    setState(s => ({ ...s, isOpen: false }));
    const resolver = getConfirmResolver();
    if (resolver) {
      resolver(state.showInput ? state.inputValue : true);
      setConfirmResolver(null);
    }
  };

  const handleCancel = () => {
    setState(s => ({ ...s, isOpen: false }));
    const resolver = getConfirmResolver();
    if (resolver) {
      resolver(false);
      setConfirmResolver(null);
    }
  };

  if (!state.isOpen) return null;

  const cfg = typeConfig[state.type] || typeConfig.warning;
  const TypeIcon = cfg.icon;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
         onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}>
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-200'}`}
        style={{ animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Icon */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className={`p-4 rounded-full ${isDarkMode ? cfg.darkBg : cfg.lightBg}`}
               style={{ animation: 'iconPulse 0.6s ease-out' }}>
            <TypeIcon className={`w-12 h-12 ${isDarkMode ? cfg.darkText : cfg.lightText}`} strokeWidth={1.5} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-2 text-center">
          <h3 className={`text-xl font-bold mt-4 mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{state.title}</h3>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{state.message}</p>

          {state.showInput && (
            <div className="mt-4">
              <input
                type="text"
                placeholder={state.inputPlaceholder}
                className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-semibold text-sm ${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400'}`}
                value={state.inputValue}
                onChange={(e) => setState(s => ({ ...s, inputValue: e.target.value }))}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="px-6 pb-8 pt-4 flex gap-3">
          <button
            onClick={handleCancel}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
          >
            {state.cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={state.inputRequired && !state.inputValue.trim()}
            className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg active:scale-[0.98]
              ${state.inputRequired && !state.inputValue.trim() 
                ? (isDarkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none' : 'bg-gray-300 text-gray-400 cursor-not-allowed shadow-none')
                : cfg.btnClass
              }`}
          >
            {state.confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes iconPulse {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
