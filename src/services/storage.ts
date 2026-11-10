import { AppConfig, AppNotification, SyncItem, UserProfile } from '../types';

const STORAGE_KEYS = {
  USERS: 'nexussync_users_v2',
  ACTIVE_USER_ID: 'nexussync_active_user_id_v2',
  ITEMS: 'nexussync_items_v2',
  QUEUE: 'nexussync_offline_queue_v2',
  CONFIG: 'nexussync_config_v2',
  NOTIFICATIONS: 'nexussync_notifications_v2',
  LAST_SYNC: 'nexussync_last_sync_v2',
  DEVICE_ID: 'nexussync_device_id_v2',
};

// Default seed accounts for multi-account login and quick switching
export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr-admin-1',
    name: 'Administrador Principal',
    email: 'admin@nexussync.local',
    role: 'Administrador',
    avatar: 'A',
    color: 'from-blue-600 to-indigo-600',
    pin: '1234',
    biometricEnrolled: true,
    biometricCredentialId: 'cred-admin-fido2',
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: 'usr-eng-2',
    name: 'Mariana Silva',
    email: 'mariana.silva@nexussync.local',
    role: 'Engenheiro',
    avatar: 'M',
    color: 'from-emerald-600 to-teal-600',
    pin: '5678',
    biometricEnrolled: true,
    biometricCredentialId: 'cred-mariana-hw',
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    lastActive: new Date(Date.now() - 3600000 * 3).toISOString(),
    isCurrent: false,
  },
  {
    id: 'usr-ops-3',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@nexussync.local',
    role: 'Operador',
    avatar: 'C',
    color: 'from-violet-600 to-purple-600',
    pin: '0000',
    biometricEnrolled: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    lastActive: new Date(Date.now() - 3600000 * 8).toISOString(),
    isCurrent: false,
  },
];

export const DEFAULT_CONFIG: AppConfig = {
  mode: 'servidor', // or 'cliente'
  remoteServerUrl: '',
  pairingToken: '',
  autoSyncIntervalSec: 15,
  biometricLockEnabled: true,
  biometricOnAccountSwitch: true,
  autoLockMinutes: 10,
  pushNotificationsEnabled: true,
  soundEnabled: true,
};

export const INITIAL_ITEMS: SyncItem[] = [
  {
    id: 'item-101',
    title: 'Diretrizes de Infraestrutura de Servidor Unificado',
    category: 'documento',
    content: 'Configurações de balanceamento, tolerância a falhas offline e sincronização em malha descentralizada.',
    author: 'Administrador Principal',
    authorEmail: 'admin@nexussync.local',
    version: 3,
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'sincronizado',
    sizeBytes: 2450,
  },
  {
    id: 'item-102',
    title: 'Checklist de Auditoria Biométrica e Criptografia WebAuthn',
    category: 'seguranca',
    content: 'Validação de chaves públicas FIDO2/WebAuthn, certificados biométricos e proteção de dados em repouso.',
    author: 'Administrador Principal',
    authorEmail: 'admin@nexussync.local',
    version: 2,
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'sincronizado',
    sizeBytes: 1820,
  },
  {
    id: 'item-103',
    title: 'Migração de Dados Clientes Remotos - Filial Sul',
    category: 'tarefa',
    content: 'Parear novos computadores clientes através do token seguro e validar taxa de sincronização contínua.',
    author: 'Mariana Silva',
    authorEmail: 'mariana.silva@nexussync.local',
    version: 1,
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    status: 'sincronizado',
    sizeBytes: 940,
  },
  {
    id: 'item-104',
    title: 'Perfil de Sincronização em Background e Push Notifications',
    category: 'configuracao',
    content: 'Intervalo de heartbeat de 15 segundos, compressão delta e notificação de push ativada para nós conectados.',
    author: 'Carlos Mendes',
    authorEmail: 'carlos.mendes@nexussync.local',
    version: 4,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    status: 'sincronizado',
    sizeBytes: 1250,
  },
];

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'node-local';
  let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    id = 'device-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
}

export function loadUsers(): UserProfile[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      saveUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: UserProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getActiveUser(): UserProfile {
  const users = loadUsers();
  const activeId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) : null;
  const user = users.find((u) => u.id === activeId) || users[0] || DEFAULT_USERS[0];
  return user;
}

export function setActiveUser(userId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  const users = loadUsers().map((u) => ({
    ...u,
    isCurrent: u.id === userId,
    lastActive: u.id === userId ? new Date().toISOString() : u.lastActive,
  }));
  saveUsers(users);
}

export function loadItems(): SyncItem[] {
  if (typeof window === 'undefined') return INITIAL_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      saveItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveItems(items: SyncItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

export function loadOfflineQueue(): SyncItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(item: SyncItem) {
  const queue = loadOfflineQueue();
  const existingIdx = queue.findIndex((q) => q.id === item.id);
  if (existingIdx >= 0) {
    queue[existingIdx] = item;
  } else {
    queue.push(item);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  }
}

export function clearOfflineQueue() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
  }
}

export function loadConfig(): AppConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      saveConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(cfg: AppConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
}

export function loadNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifs: AppNotification[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs.slice(0, 50)));
}

export function getLastSyncTime(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
}

export function setLastSyncTime(timestamp: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
}
