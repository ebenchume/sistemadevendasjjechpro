import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  queuedCount: number;
  onSyncNow?: () => void;
  isSyncing?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  queuedCount,
  onSyncNow,
  isSyncing,
}) => {
  if (isOnline && queuedCount === 0) return null;

  if (!isOnline) {
    return (
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/90 px-4 py-2.5 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
          <WifiOff className="h-4 w-4 animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-amber-100">Modo Offline Ativo</p>
          <p className="text-[11px] text-amber-300/80">
            {queuedCount > 0
              ? `${queuedCount} alteraçõ${queuedCount > 1 ? 'es' : 'ão'} na fila local (auto-sync ao reconectar)`
              : 'Navegação e dados em cache local'}
          </p>
        </div>
      </div>
    );
  }

  // Online with pending queue
  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-3 rounded-xl border border-sky-500/30 bg-slate-900/95 px-4 py-2.5 text-xs font-medium text-sky-200 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      </div>
      <div>
        <p className="font-semibold text-slate-100">{queuedCount} pendente(s) para sincronização</p>
        <p className="text-[11px] text-slate-400">Dados salvos localmente aguardando upload</p>
      </div>
      {onSyncNow && (
        <button
          onClick={onSyncNow}
          disabled={isSyncing}
          className="ml-2 rounded-lg bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-sky-500 transition disabled:opacity-50"
        >
          {isSyncing ? 'Sincronizando...' : 'Enviar Agora'}
        </button>
      )}
    </div>
  );
};
