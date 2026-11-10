import { AppConfig, ConnectedNode, SecurityAudit, SyncItem, SyncStatsSummary } from '../types';
import { loadConfig } from './storage';

function getApiBaseUrl(): string {
  const config = loadConfig();
  if (config.mode === 'cliente' && config.remoteServerUrl.trim()) {
    return config.remoteServerUrl.replace(/\/+$/, '');
  }
  return '';
}

export async function fetchServerStatus(): Promise<{
  success: boolean;
  appName: string;
  version: string;
  mode: string;
  pairingToken: string;
  uptimeSeconds: number;
  totalItems: number;
  connectedNodesCount: number;
  localIps: string[];
  port: number;
  timestamp: string;
  publicAppUrl: string;
} | null> {
  const base = getApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${base}/api/status`, { credentials: 'omit', signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function regeneratePairingToken(userEmail: string): Promise<string | null> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/pairing-token/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.pairingToken || null;
  } catch {
    return null;
  }
}

export async function fetchConnectedNodes(): Promise<ConnectedNode[]> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/nodes`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.nodes || [];
  } catch {
    return [];
  }
}

export async function pairRemoteNode(
  deviceName: string,
  platform: string,
  token: string,
  deviceType: 'desktop' | 'mobile',
  userEmail: string,
  customServerUrl?: string
): Promise<{ success: boolean; message: string; node?: ConnectedNode }> {
  const base = (customServerUrl || getApiBaseUrl()).replace(/\/+$/, '');
  try {
    const res = await fetch(`${base}/api/nodes/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceName, platform, token, deviceType, userEmail }),
    });
    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha na conexão de rede';
    return { success: false, message: `Não foi possível conectar ao servidor: ${message}` };
  }
}

export async function disconnectNode(id: string): Promise<boolean> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/nodes/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullSyncFromServer(since?: string): Promise<{
  success: boolean;
  items: SyncItem[];
  serverTimestamp: string;
} | null> {
  const base = getApiBaseUrl();
  const url = since ? `${base}/api/sync/pull?since=${encodeURIComponent(since)}` : `${base}/api/sync/pull`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function pushSyncToServer(
  items: SyncItem[],
  deviceName: string,
  userEmail: string
): Promise<{
  success: boolean;
  message: string;
  serverTimestamp: string;
  currentItems: SyncItem[];
} | null> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/sync/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, deviceName, userEmail }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchStatsFromServer(): Promise<{
  summary: SyncStatsSummary;
  categoryDistribution: Record<string, number>;
  recentAudits: SecurityAudit[];
} | null> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/stats`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function recordSecurityAudit(
  userEmail: string,
  event: string,
  method: SecurityAudit['method'],
  success: boolean
): Promise<void> {
  const base = getApiBaseUrl();
  try {
    await fetch(`${base}/api/security/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, event, method, success }),
    });
  } catch {
    // ignore
  }
}
