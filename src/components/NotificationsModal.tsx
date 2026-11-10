import React from 'react';
import { AppNotification } from '../types';
import { Bell, CheckCircle2, ShieldAlert, Wifi, Info, AlertTriangle, Trash2, X, CheckCheck } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDismiss: (id: string) => void;
  onTriggerTestPush: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onDismiss,
  onTriggerTestPush,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Central de Notificações Push &amp; Nuvem</h3>
              <p className="text-[11px] text-slate-400">
                {notifications.length} registro(s) no histórico
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="py-3 flex items-center justify-between border-b border-slate-800/80 text-xs">
          <button
            onClick={onTriggerTestPush}
            className="flex items-center gap-1.5 font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Emitir Teste Push</span>
          </button>

          <div className="flex items-center gap-3">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Marcar lidas</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar histórico</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-thin">
          {notifications.map((n) => {
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

            return (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition ${
                  n.read
                    ? 'border-slate-800/60 bg-slate-950/40 text-slate-400'
                    : 'border-slate-700 bg-slate-800/60 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">{getIcon()}</div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{n.title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      {new Date(n.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDismiss(n.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Bell className="mx-auto h-8 w-8 text-slate-700 mb-2" />
              <p>Nenhuma notificação no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
