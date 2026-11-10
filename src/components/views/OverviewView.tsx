import React, { useState } from 'react';
import {
  Layers,
  Database,
  Server,
  ShieldCheck,
  RefreshCw,
  Plus,
  Wifi,
  WifiOff,
  Bell,
  ArrowRight,
  HardDrive,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AppConfig, ItemCategory, SyncItem, UserProfile } from '../../types';
import { ActiveTab } from '../Navbar';

interface OverviewViewProps {
  items: SyncItem[];
  activeUser: UserProfile;
  config: AppConfig;
  isOnline: boolean;
  isSyncing: boolean;
  onSyncNow: () => void;
  lastSyncTime: string | null;
  queuedCount: number;
  onNavigateTab: (tab: ActiveTab) => void;
  onAddItem: (item: { title: string; category: ItemCategory; content: string }) => void;
  onTriggerTestNotification: () => void;
  serverStatus: {
    appName: string;
    version: string;
    mode: string;
    pairingToken: string;
    uptimeSeconds: number;
    connectedNodesCount: number;
    localIps: string[];
    port: number;
    publicAppUrl: string;
  } | null;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  items,
  activeUser,
  config,
  isOnline,
  isSyncing,
  onSyncNow,
  lastSyncTime,
  queuedCount,
  onNavigateTab,
  onAddItem,
  onTriggerTestNotification,
  serverStatus,
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<ItemCategory>('documento');
  const [quickContent, setQuickContent] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickContent.trim()) return;
    onAddItem({
      title: quickTitle.trim(),
      category: quickCategory,
      content: quickContent.trim(),
    });
    setQuickTitle('');
    setQuickContent('');
    setShowQuickAdd(false);
  };

  const totalBytes = items.reduce((acc, i) => acc + (i.sizeBytes || 1024), 0);
  const formattedStorage = (totalBytes / 1024).toFixed(1) + ' KB';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Welcome & Mode Status */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Sistema Operacional Ativo
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                {config.mode === 'servidor' ? 'Hub Central (Host)' : 'Nó Conectado (Cliente)'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Olá, {activeUser.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              NexusSync está conectado e sincronizando em tempo real com tolerância a falhas offline,
              biometria FIDO2 e suporte a nós distribuídos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowQuickAdd(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-500 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro</span>
            </button>

            <button
              onClick={onSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Nuvem'}</span>
            </button>
          </div>
        </div>

        {/* Quick Add Inline Modal */}
        {showQuickAdd && (
          <form
            onSubmit={handleCreate}
            className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-3 animate-in fade-in"
          >
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Título do documento, nota ou tarefa..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                autoFocus
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value as ItemCategory)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="documento">Documento</option>
                <option value="tarefa">Tarefa</option>
                <option value="seguranca">Segurança</option>
                <option value="configuracao">Configuração</option>
                <option value="nota">Nota Rápida</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition"
              >
                Salvar &amp; Enfileirar
              </button>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
            </div>
            <div className="md:col-span-4">
              <textarea
                placeholder="Conteúdo ou detalhes a sincronizar..."
                value={quickContent}
                onChange={(e) => setQuickContent(e.target.value)}
                rows={2}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>
          </form>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div
          onClick={() => onNavigateTab('data')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/40 hover:bg-slate-900 transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total de Registros</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{items.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">100% integridade</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {queuedCount > 0 ? `${queuedCount} pendentes no cache local` : 'Todos sincronizados com a nuvem'}
          </p>
        </div>

        {/* Sync Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Status da Sincronização</span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {isOnline ? (queuedCount > 0 ? 'Na Fila' : 'Ativo') : 'Offline'}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">
              {isSyncing ? 'Sincronizando...' : 'Auto-Sync 15s'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {lastSyncTime ? `Último: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Aguardando primeiro sync'}
          </p>
        </div>

        {/* Connected Computers / Nodes */}
        <div
          onClick={() => onNavigateTab('network')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-500/40 hover:bg-slate-900 transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Nós de Rede / Clientes</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {serverStatus ? serverStatus.connectedNodesCount : 3}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">Computadores</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Acesso remoto unificado habilitado</p>
        </div>

        {/* Security & Biometrics */}
        <div
          onClick={() => onNavigateTab('security')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/40 hover:bg-slate-900 transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Proteção Biométrica</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">FIDO2</span>
            <span className="text-xs text-emerald-400 font-semibold">WebAuthn</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {activeUser.biometricEnrolled ? 'Biometria ativa neste perfil' : 'PIN de emergência configurado'}
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Synchronized Records & Remote Server Hub Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Synced Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Registros Sincronizados Recentes
              </h2>
              <p className="text-xs text-slate-400">Armazenados no banco local e replicados no servidor</p>
            </div>
            <button
              onClick={() => onNavigateTab('data')}
              className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              <span>Ver todos ({items.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {items.slice(0, 5).map((item) => {
              const categoryBadgeColors = {
                documento: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                tarefa: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                seguranca: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                configuracao: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                nota: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
              };

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          categoryBadgeColors[item.category] || categoryBadgeColors.documento
                        }`}
                      >
                        {item.category}
                      </span>
                      <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{item.content}</p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span>Autor: {item.author}</span>
                      <span>•</span>
                      <span>v{item.version}</span>
                      <span>•</span>
                      <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'sincronizado'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.status === 'sincronizado' ? 'Nuvem OK' : 'Local'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(item.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Network Hub & Push Test */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Nó Central de Acesso Remoto
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Porta 3000
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Modo de Operação:</span>
                <span className="font-semibold text-white capitalize">
                  {config.mode === 'servidor' ? 'Servidor Host' : 'Cliente Remoto'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Token de Pareamento:</span>
                <span className="font-mono text-cyan-300 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {serverStatus?.pairingToken || 'NEXUS-SYNC'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">IPs na Rede Local:</span>
                <span className="font-mono text-[11px] text-slate-300">
                  {serverStatus?.localIps?.[0] || '127.0.0.1'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Armazenamento:</span>
                <span className="font-semibold text-white">{formattedStorage}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('network')}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
              >
                <span>Configurar Servidor &amp; Pareamento</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Push Notifications Quick Test Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Notificações Push
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receba alertas no navegador e dispositivos conectados sobre novos dados sincronizados,
              desconexões e auditorias de segurança.
            </p>
            <button
              onClick={onTriggerTestNotification}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Testar Notificação Push &amp; Som</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
