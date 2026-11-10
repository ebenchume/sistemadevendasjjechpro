import React from 'react';
import { AppNotification } from '../types';
import { CheckCircle2, ShieldAlert, Wifi, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContainerProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onDismiss }) => {
  // Show only last 3 active toasts
  const activeToasts = notifications.slice(0, 3);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {activeToasts.map((n) => {
        const getIcon = () => {
          switch (n.type) {
            case 'sync':
              return <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />;
            case 'security':
              return <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />;
            case 'network':
              return <Wifi className="w-4 h-4 text-indigo-400 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
            default:
              return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
          }
        };

        const getBorder = () => {
          switch (n.type) {
            case 'sync':
              return 'border-cyan-500/30 bg-slate-900/95';
            case 'security':
              return 'border-emerald-500/30 bg-slate-900/95';
            case 'network':
              return 'border-indigo-500/30 bg-slate-900/95';
            case 'warning':
              return 'border-amber-500/30 bg-slate-900/95';
            default:
              return 'border-slate-700 bg-slate-900/95';
          }
        };

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${getBorder()} p-3.5 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200`}
          >
            <div className="mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white truncate">{n.title}</h4>
              <p className="mt-0.5 text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{n.message}</p>
              <span className="mt-1 block text-[10px] text-slate-500">
                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <button
              onClick={() => onDismiss(n.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
