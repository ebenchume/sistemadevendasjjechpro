import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Layers,
  Database,
  Server,
  BarChart3,
  Users,
  Lock,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
  ChevronDown,
  UserPlus,
  Check,
  Radio,
} from 'lucide-react';
import { AppConfig, AppNotification, UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'overview' | 'data' | 'network' | 'stats' | 'security' | 'accounts';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (userId: string) => void;
  onLockApp: () => void;
  isOnline: boolean;
  isSyncing: boolean;
  onSyncNow: () => void;
  lastSyncTime: string | null;
  config: AppConfig;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  activeUser,
  allUsers,
  onSwitchUser,
  onLockApp,
  isOnline,
  isSyncing,
  onSyncNow,
  lastSyncTime,
  config,
  notifications,
  onOpenNotifications,
}) => {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: Layers },
    { id: 'data', label: 'Dados & Nuvem', icon: Database },
    { id: 'network', label: 'Servidor & Rede', icon: Server },
    { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
    { id: 'security', label: 'Segurança & Biometria', icon: Shield },
    { id: 'accounts', label: 'Contas & Perfis', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Mode Pill */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Radio className="h-5 w-5 text-cyan-400 group-hover:rotate-45 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">NexusSync</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 -mt-0.5 hidden sm:block">
                {config.mode === 'servidor' ? 'Hub Servidor Central' : 'Nó Cliente Remoto'}
              </p>
            </div>
          </div>

          {/* Mode Badge */}
          <div
            onClick={() => onSelectTab('network')}
            className={`hidden md:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border cursor-pointer transition ${
              config.mode === 'servidor'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/30'
                : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/30'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                config.mode === 'servidor' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400 animate-pulse'
              }`}
            />
            <span>{config.mode === 'servidor' ? 'Modo Servidor (Host)' : 'Modo Cliente Remoto'}</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Sync, Install, Profile */}
        <div className="flex items-center gap-2.5">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Sync Trigger Button */}
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className={`hidden sm:flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
              isSyncing
                ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={
              lastSyncTime
                ? `Última sincronização: ${new Date(lastSyncTime).toLocaleTimeString()}`
                : 'Sincronizar com a nuvem'
            }
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden xl:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>

          {/* Online/Offline Status Indicator Pill */}
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium border ${
              isOnline
                ? 'border-emerald-500/20 bg-emerald-950/30 text-emerald-300'
                : 'border-amber-500/20 bg-amber-950/30 text-amber-300'
            }`}
            title={isOnline ? 'Conectado à rede' : 'Sem conexão de rede (armazenamento offline ativo)'}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
            <span className="text-[10px] hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Notificações e Avisos de Sincronização"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-slate-950 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Quick Biometric Lock Button */}
          <button
            onClick={onLockApp}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-slate-800 transition"
            title="Bloquear aplicativo agora (Exige Biometria/PIN)"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Multi-Account Switcher Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 py-1 pl-1.5 pr-2.5 text-xs text-slate-200 hover:bg-slate-800/90 transition shadow-sm"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr ${activeUser.color} text-white font-bold text-xs shadow-sm`}
              >
                {activeUser.avatar || activeUser.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-white truncate max-w-[100px] leading-tight">
                  {activeUser.name}
                </p>
                <p className="text-[10px] text-slate-400 leading-none">{activeUser.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Account Switcher Dropdown */}
            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-700/80 bg-slate-900/98 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Alternar Conta Ativa
                  </p>
                  <p className="text-xs text-slate-200 font-medium truncate mt-0.5">
                    {activeUser.email}
                  </p>
                </div>

                <div className="mt-1 space-y-1">
                  {allUsers.map((u) => {
                    const isSelected = u.id === activeUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setAccountMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                          isSelected ? 'bg-indigo-600/20 text-white border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr ${u.color} text-white font-bold text-[10px]`}
                          >
                            {u.avatar || u.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                  <button
                    onClick={() => {
                      onSelectTab('accounts');
                      setAccountMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Criar Novo Usuário / Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onLockApp();
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40 transition"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Bloquear com Biometria</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-900 scrollbar-none gap-1 bg-slate-950/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as ActiveTab)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
