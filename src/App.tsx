/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AppConfig,
  AppNotification,
  ConnectedNode,
  ItemCategory,
  SecurityAudit,
  SyncItem,
  SyncStatsSummary,
  UserProfile,
} from './types';
import {
  addToOfflineQueue,
  clearOfflineQueue,
  getActiveUser,
  getDeviceId,
  getLastSyncTime,
  loadConfig,
  loadItems,
  loadNotifications,
  loadOfflineQueue,
  loadUsers,
  saveConfig,
  saveItems,
  saveNotifications,
  saveUsers,
  setActiveUser,
  setLastSyncTime,
} from './services/storage';
import {
  disconnectNode,
  fetchConnectedNodes,
  fetchServerStatus,
  fetchStatsFromServer,
  pairRemoteNode,
  pullSyncFromServer,
  pushSyncToServer,
  recordSecurityAudit,
  regeneratePairingToken,
} from './services/api';
import { createNotification, playNotificationSound } from './services/notifications';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { ActiveTab, Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BiometricModal } from './components/BiometricModal';
import { ToastContainer } from './components/ToastContainer';
import { NotificationsModal } from './components/NotificationsModal';
import { OverviewView } from './components/views/OverviewView';
import { DataView } from './components/views/DataView';
import { RemoteNetworkView } from './components/views/RemoteNetworkView';
import { StatsView } from './components/views/StatsView';
import { SecurityView } from './components/views/SecurityView';
import { AccountsView } from './components/views/AccountsView';
import { Lock, Fingerprint } from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();

  // App Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // User & Accounts State
  const [users, setUsers] = useState<UserProfile[]>(() => loadUsers());
  const [activeUser, setCurrentUser] = useState<UserProfile>(() => getActiveUser());
  const [targetSwitchUserId, setTargetSwitchUserId] = useState<string | null>(null);

  // App Configuration
  const [config, setConfig] = useState<AppConfig>(() => loadConfig());

  // Data & Queue State
  const [items, setItems] = useState<SyncItem[]>(() => loadItems());
  const [queuedItems, setQueuedItems] = useState<SyncItem[]>(() => loadOfflineQueue());
  const [lastSync, setLastSync] = useState<string | null>(() => getLastSyncTime());
  const [isSyncing, setIsSyncing] = useState(false);

  // Network & Server State
  const [nodes, setNodes] = useState<ConnectedNode[]>([]);
  const [serverStatus, setServerStatus] = useState<{
    appName: string;
    version: string;
    mode: string;
    pairingToken: string;
    uptimeSeconds: number;
    connectedNodesCount: number;
    localIps: string[];
    port: number;
    publicAppUrl: string;
  } | null>(null);

  // Security & Audits
  const [audits, setAudits] = useState<SecurityAudit[]>([]);
  const [statsSummary, setStatsSummary] = useState<SyncStatsSummary | null>(null);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [biometricModalPurpose, setBiometricModalPurpose] = useState<'unlock' | 'switch_account'>('unlock');

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadNotifications());
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  // Inactivity Timer Ref
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save Config on update
  const handleUpdateConfig = useCallback((updates: Partial<AppConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      saveConfig(next);
      return next;
    });
  }, []);

  // Dispatch a notification
  const notify = useCallback(
    (title: string, message: string, type: AppNotification['type'] = 'info') => {
      const n = createNotification(title, message, type, config.soundEnabled);
      setNotifications((prev) => {
        const next = [n, ...prev].slice(0, 50);
        saveNotifications(next);
        return next;
      });
    },
    [config.soundEnabled]
  );

  // Refresh Server Status & Nodes
  const refreshServerInfo = useCallback(async () => {
    if (!isOnline) return;
    try {
      const [status, nodesData, statsData] = await Promise.all([
        fetchServerStatus(),
        fetchConnectedNodes(),
        fetchStatsFromServer(),
      ]);

      if (status) setServerStatus(status);
      if (nodesData && nodesData.length > 0) setNodes(nodesData);
      if (statsData) {
        setStatsSummary(statsData.summary);
        if (statsData.recentAudits) setAudits(statsData.recentAudits);
      }
    } catch {
      // Offline fallback
    }
  }, [isOnline]);

  // Main Bidirectional Sync
  const performSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);

    try {
      const deviceId = getDeviceId();
      const currentQueue = loadOfflineQueue();

      // 1. Push pending offline queue if any
      if (currentQueue.length > 0) {
        const pushRes = await pushSyncToServer(currentQueue, `Nexus-Node (${activeUser.name})`, activeUser.email);
        if (pushRes && pushRes.success) {
          clearOfflineQueue();
          setQueuedItems([]);
          notify(
            'Fila Offline Sincronizada',
            `${currentQueue.length} alteraçõ${currentQueue.length > 1 ? 'es' : 'ão'} enviadas com sucesso para a nuvem.`,
            'sync'
          );
        }
      }

      // 2. Pull server changes
      const pullRes = await pullSyncFromServer();
      if (pullRes && pullRes.success) {
        setItems(pullRes.items);
        saveItems(pullRes.items);
        const syncTimestamp = new Date().toISOString();
        setLastSync(syncTimestamp);
        setLastSyncTime(syncTimestamp);
      }

      await refreshServerInfo();
    } catch (err: unknown) {
      console.warn('[NexusSync] Sync paused:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, activeUser, notify, refreshServerInfo]);

  // Initial load & periodic sync loop
  useEffect(() => {
    refreshServerInfo();

    const interval = setInterval(() => {
      performSync();
    }, (config.autoSyncIntervalSec || 15) * 1000);

    return () => clearInterval(interval);
  }, [config.autoSyncIntervalSec, performSync, refreshServerInfo]);

  // Auto-sync when recovering online connectivity
  useEffect(() => {
    if (isOnline) {
      performSync();
    }
  }, [isOnline, performSync]);

  // Inactivity Auto-Lock listener
  useEffect(() => {
    if (!config.autoLockMinutes || config.autoLockMinutes === 0) return;

    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (!isAppLocked) {
        inactivityTimerRef.current = setTimeout(() => {
          setIsAppLocked(true);
        }, config.autoLockMinutes * 60 * 1000);
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [config.autoLockMinutes, isAppLocked]);

  // User Actions
  const handleAddItem = (data: { title: string; category: ItemCategory; content: string }) => {
    const newItem: SyncItem = {
      id: 'item-' + Date.now(),
      title: data.title,
      category: data.category,
      content: data.content,
      author: activeUser.name,
      authorEmail: activeUser.email,
      version: 1,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: isOnline ? 'sincronizado' : 'pendente',
      sizeBytes: data.title.length + data.content.length * 2,
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    saveItems(updatedItems);

    if (!isOnline) {
      addToOfflineQueue(newItem);
      setQueuedItems(loadOfflineQueue());
      notify('Salvo Offline', `"${newItem.title}" foi enfileirado para sincronização na nuvem.`, 'info');
    } else {
      // Immediate push
      pushSyncToServer([newItem], `Dispositivo (${activeUser.name})`, activeUser.email).then(() => {
        notify('Sincronizado na Nuvem', `"${newItem.title}" foi replicado com sucesso no servidor.`, 'sync');
        refreshServerInfo();
      });
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<SyncItem>) => {
    const updated = items.map((i) => (i.id === id ? { ...i, ...updates } : i));
    setItems(updated);
    saveItems(updated);

    const changedItem = updated.find((i) => i.id === id);
    if (changedItem) {
      if (!isOnline) {
        addToOfflineQueue(changedItem);
        setQueuedItems(loadOfflineQueue());
        notify('Salvo Offline', `Alterações em "${changedItem.title}" salvas no cache local.`, 'info');
      } else {
        pushSyncToServer([changedItem], `Dispositivo (${activeUser.name})`, activeUser.email).then(() => {
          notify('Atualizado na Nuvem', `"${changedItem.title}" sincronizado.`, 'sync');
        });
      }
    }
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveItems(updated);
    notify('Registro Removido', 'Item excluído do banco de dados unificado.', 'info');
  };

  // Switch User with optional Biometric check
  const handleSwitchUserRequest = (userId: string) => {
    if (userId === activeUser.id) return;
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    if (config.biometricOnAccountSwitch) {
      setTargetSwitchUserId(userId);
      setBiometricModalPurpose('switch_account');
      setBiometricModalOpen(true);
    } else {
      executeUserSwitch(userId);
    }
  };

  const executeUserSwitch = (userId: string) => {
    setActiveUser(userId);
    const refreshed = loadUsers();
    setUsers(refreshed);
    const newActive = refreshed.find((u) => u.id === userId) || refreshed[0];
    setCurrentUser(newActive);
    recordSecurityAudit(newActive.email, `Sessão alternada para '${newActive.name}'`, 'biometria', true);
    notify('Conta Alternada', `Você agora está operando como ${newActive.name} (${newActive.role}).`, 'security');
  };

  const handleCreateUser = (newUser: Omit<UserProfile, 'id' | 'createdAt' | 'lastActive'>) => {
    const created: UserProfile = {
      ...newUser,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    const nextUsers = [...users, created];
    setUsers(nextUsers);
    saveUsers(nextUsers);
    notify('Novo Perfil Criado', `Usuário ${created.name} (${created.role}) cadastrado com sucesso.`, 'security');
  };

  const handleUpdateActiveUser = (updates: Partial<UserProfile>) => {
    const updatedUser = { ...activeUser, ...updates };
    setCurrentUser(updatedUser);
    const nextUsers = users.map((u) => (u.id === activeUser.id ? updatedUser : u));
    setUsers(nextUsers);
    saveUsers(nextUsers);
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) return;
    const nextUsers = users.filter((u) => u.id !== userId);
    setUsers(nextUsers);
    saveUsers(nextUsers);
    notify('Conta Removida', 'Perfil excluído do sistema.', 'info');
  };

  // Remote Pairing
  const handlePairRemoteClient = async (
    deviceName: string,
    serverUrl: string,
    token: string,
    deviceType: 'desktop' | 'mobile'
  ) => {
    const res = await pairRemoteNode(
      deviceName,
      navigator.userAgent,
      token,
      deviceType,
      activeUser.email,
      serverUrl
    );
    if (res.success) {
      notify('Cliente Pareado', `Conexão estabelecida com ${deviceName}.`, 'network');
      await refreshServerInfo();
    }
    return res;
  };

  const handleRegenerateToken = async () => {
    const newToken = await regeneratePairingToken(activeUser.email);
    if (newToken) {
      if (serverStatus) {
        setServerStatus({ ...serverStatus, pairingToken: newToken });
      }
      notify('Token Renovado', 'Novo token de pareamento remoto gerado.', 'security');
    }
  };

  const handleDisconnectNode = async (id: string) => {
    const ok = await disconnectNode(id);
    if (ok) {
      setNodes((prev) => prev.filter((n) => n.id !== id));
      notify('Nó Desconectado', 'O cliente remoto foi desvinculado do servidor.', 'network');
    }
  };

  const handleTriggerTestPush = () => {
    notify(
      'NexusSync • Teste de Notificação',
      'As notificações push e o motor de sincronização em nuvem estão 100% operacionais.',
      'sync'
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeUser={activeUser}
        allUsers={users}
        onSwitchUser={handleSwitchUserRequest}
        onLockApp={() => setIsAppLocked(true)}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onSyncNow={performSync}
        lastSyncTime={lastSync}
        config={config}
        notifications={notifications}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'overview' && (
          <OverviewView
            items={items}
            activeUser={activeUser}
            config={config}
            isOnline={isOnline}
            isSyncing={isSyncing}
            onSyncNow={performSync}
            lastSyncTime={lastSync}
            queuedCount={queuedItems.length}
            onNavigateTab={setActiveTab}
            onAddItem={handleAddItem}
            onTriggerTestNotification={handleTriggerTestPush}
            serverStatus={serverStatus}
          />
        )}

        {activeTab === 'data' && (
          <DataView
            items={items}
            activeUser={activeUser}
            isOnline={isOnline}
            isSyncing={isSyncing}
            queuedCount={queuedItems.length}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onSyncNow={performSync}
          />
        )}

        {activeTab === 'network' && (
          <RemoteNetworkView
            config={config}
            onUpdateConfig={handleUpdateConfig}
            nodes={nodes}
            onRefreshNodes={refreshServerInfo}
            onDisconnectNode={handleDisconnectNode}
            onRegenerateToken={handleRegenerateToken}
            onPairClient={handlePairRemoteClient}
            serverStatus={serverStatus}
            activeUser={activeUser}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            items={items}
            nodes={nodes}
            audits={audits}
            statsSummary={statsSummary}
          />
        )}

        {activeTab === 'security' && (
          <SecurityView
            activeUser={activeUser}
            onUpdateUser={handleUpdateActiveUser}
            config={config}
            onUpdateConfig={handleUpdateConfig}
            audits={audits}
            onRecordAudit={(event, method, success) => {
              recordSecurityAudit(activeUser.email, event, method, success);
              refreshServerInfo();
            }}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            users={users}
            activeUser={activeUser}
            onSwitchUser={handleSwitchUserRequest}
            onCreateUser={handleCreateUser}
            onUpdateUser={(id, updates) => {
              if (id === activeUser.id) {
                handleUpdateActiveUser(updates);
              } else {
                setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
                saveUsers(users);
              }
            }}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>

      {/* Offline Mode Indicator & Local Queue Banner */}
      <OfflineIndicator
        isOnline={isOnline}
        queuedCount={queuedItems.length}
        onSyncNow={performSync}
        isSyncing={isSyncing}
      />

      {/* System Push Toasts Stack */}
      <ToastContainer
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />

      {/* Full Screen Inactivity Lock Screen */}
      {isAppLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 animate-in fade-in">
          <BiometricModal
            isOpen={true}
            user={activeUser}
            title="Sessão Bloqueada por Segurança"
            description="Toque no sensor biométrico ou insira seu PIN mestre para retomar o acesso aos dados da nuvem."
            canCancel={false}
            onSuccess={() => {
              setIsAppLocked(false);
              recordSecurityAudit(activeUser.email, 'Desbloqueio biométrico bem-sucedido', 'biometria', true);
            }}
          />
        </div>
      )}

      {/* Account Switch Biometric Confirmation Modal */}
      {biometricModalOpen && (
        <BiometricModal
          isOpen={true}
          user={activeUser}
          title="Autorizar Troca de Conta"
          description="Confirme sua identidade biométrica para transferir a sessão de trabalho."
          canCancel={true}
          onCancel={() => {
            setBiometricModalOpen(false);
            setTargetSwitchUserId(null);
          }}
          onSuccess={() => {
            setBiometricModalOpen(false);
            if (targetSwitchUserId) {
              executeUserSwitch(targetSwitchUserId);
              setTargetSwitchUserId(null);
            }
          }}
        />
      )}

      {/* Notifications Drawer / Modal */}
      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => {
            const next = prev.map((n) => ({ ...n, read: true }));
            saveNotifications(next);
            return next;
          });
        }}
        onClearAll={() => {
          setNotifications([]);
          saveNotifications([]);
        }}
        onDismiss={(id) => {
          setNotifications((prev) => {
            const next = prev.filter((n) => n.id !== id);
            saveNotifications(next);
            return next;
          });
        }}
        onTriggerTestPush={handleTriggerTestPush}
      />
    </div>
  );
}
