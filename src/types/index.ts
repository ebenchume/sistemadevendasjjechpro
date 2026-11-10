export type UserRole = 'Administrador' | 'Engenheiro' | 'Operador' | 'Auditor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  color: string;
  pin: string;
  biometricEnrolled: boolean;
  biometricCredentialId?: string;
  createdAt: string;
  lastActive: string;
  isCurrent?: boolean;
}

export type ItemCategory = 'documento' | 'tarefa' | 'configuracao' | 'nota' | 'seguranca';

export interface SyncItem {
  id: string;
  title: string;
  category: ItemCategory;
  content: string;
  author: string;
  authorEmail: string;
  version: number;
  updatedAt: string;
  createdAt: string;
  status: 'sincronizado' | 'pendente' | 'arquivado';
  sizeBytes: number;
  isLocalOnly?: boolean;
}

export interface ConnectedNode {
  id: string;
  name: string;
  ip: string;
  platform: string;
  type: 'servidor_central' | 'cliente_desktop' | 'cliente_mobile';
  lastPing: string;
  syncedItemsCount: number;
  status: 'online' | 'ocioso' | 'desconectado';
  latencyMs: number;
}

export interface SecurityAudit {
  id: string;
  timestamp: string;
  userEmail: string;
  event: string;
  method: 'biometria' | 'pin' | 'token_rede' | 'sistema';
  success: boolean;
  ip: string;
}

export interface SyncStatsSummary {
  totalItems: number;
  totalStorageBytes: number;
  activeNodes: number;
  idleNodes: number;
  totalNodes: number;
  syncSuccessRatePercent: number;
  biometricSuccessRatePercent: number;
  averageLatencyMs: number;
  uptimeSeconds: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'sync' | 'security' | 'network' | 'warning';
  read: boolean;
}

export type OperationMode = 'servidor' | 'cliente';

export interface AppConfig {
  mode: OperationMode;
  remoteServerUrl: string;
  pairingToken: string;
  autoSyncIntervalSec: number;
  biometricLockEnabled: boolean;
  biometricOnAccountSwitch: boolean;
  autoLockMinutes: number;
  pushNotificationsEnabled: boolean;
  soundEnabled: boolean;
}
