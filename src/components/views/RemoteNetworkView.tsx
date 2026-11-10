import React, { useState } from 'react';
import {
  Server,
  Laptop,
  Smartphone,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Activity,
  ShieldCheck,
  Link2,
  Cpu,
  Globe,
  Radio,
  Terminal,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AppConfig, ConnectedNode, UserProfile } from '../../types';

interface RemoteNetworkViewProps {
  config: AppConfig;
  onUpdateConfig: (updates: Partial<AppConfig>) => void;
  nodes: ConnectedNode[];
  onRefreshNodes: () => void;
  onDisconnectNode: (id: string) => void;
  onRegenerateToken: () => void;
  onPairClient: (
    deviceName: string,
    serverUrl: string,
    token: string,
    deviceType: 'desktop' | 'mobile'
  ) => Promise<{ success: boolean; message: string }>;
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
  activeUser: UserProfile;
}

export const RemoteNetworkView: React.FC<RemoteNetworkViewProps> = ({
  config,
  onUpdateConfig,
  nodes,
  onRefreshNodes,
  onDisconnectNode,
  onRegenerateToken,
  onPairClient,
  serverStatus,
  activeUser,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showQR, setShowQR] = useState(true);

  // Client mode pairing inputs
  const [clientDeviceName, setClientDeviceName] = useState('Meu Computador Remoto');
  const [clientServerUrl, setClientServerUrl] = useState(config.remoteServerUrl || '');
  const [clientToken, setClientToken] = useState(config.pairingToken || '');
  const [clientDeviceType, setClientDeviceType] = useState<'desktop' | 'mobile'>('desktop');
  const [isPairing, setIsPairing] = useState(false);
  const [pairingFeedback, setPairingFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const token = serverStatus?.pairingToken || config.pairingToken || 'NEXUS-DEFAULT-SYNC';
  const serverHost = serverStatus?.publicAppUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const qrPayload = JSON.stringify({
    app: 'NexusSync',
    url: serverHost,
    token,
    hostIp: serverStatus?.localIps?.[0] || '127.0.0.1',
  });

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(serverHost);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleConnectClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientServerUrl.trim() || !clientToken.trim()) return;

    setIsPairing(true);
    setPairingFeedback(null);
    try {
      const res = await onPairClient(
        clientDeviceName.trim(),
        clientServerUrl.trim(),
        clientToken.trim(),
        clientDeviceType
      );
      setPairingFeedback(res);
      if (res.success) {
        onUpdateConfig({
          mode: 'cliente',
          remoteServerUrl: clientServerUrl.trim(),
          pairingToken: clientToken.trim(),
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar';
      setPairingFeedback({ success: false, message });
    } finally {
      setIsPairing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            Servidor &amp; Acesso Remoto Unificado
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure este dispositivo como <strong>Servidor Central (Host)</strong> ou conecte-se como{' '}
            <strong>Cliente Remoto</strong> em outros computadores na rede ou nuvem.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-900/90 p-1">
          <button
            onClick={() => onUpdateConfig({ mode: 'servidor' })}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              config.mode === 'servidor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Modo Servidor (Host)</span>
          </button>

          <button
            onClick={() => onUpdateConfig({ mode: 'cliente' })}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              config.mode === 'cliente'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Modo Cliente Remoto</span>
          </button>
        </div>
      </div>

      {/* SERVER MODE INTERFACE */}
      {config.mode === 'servidor' ? (
        <div className="space-y-6">
          {/* Server Info & Pairing Token Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Host Credentials & QR Code */}
            <div className="lg:col-span-1 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Pareamento QR &amp; Token
                    </h3>
                  </div>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <QRCodeSVG
                      value={qrPayload}
                      size={140}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="mt-3 text-[11px] text-center text-slate-400">
                    Aponte a câmera ou escaneie no cliente mobile/desktop para parear automaticamente.
                  </p>
                </div>

                {/* Token Display */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Token de Pareamento do Servidor
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-xs font-bold text-cyan-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 truncate">
                      {token}
                    </div>
                    <button
                      onClick={handleCopyToken}
                      className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Copiar Token"
                    >
                      {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={onRegenerateToken}
                      className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
                      title="Regenerar novo Token"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Server URL */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Endereço do Servidor
                </label>
                <div className="flex items-center gap-2">
                  <span className="flex-1 font-mono text-[11px] text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 truncate">
                    {serverHost}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Connected Nodes List */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Computadores e Clientes Conectados ({nodes.length})
                  </h3>
                </div>

                <button
                  onClick={onRefreshNodes}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Atualizar Nós</span>
                </button>
              </div>

              <div className="space-y-3">
                {nodes.map((node) => {
                  const isHost = node.type === 'servidor_central';
                  return (
                    <div
                      key={node.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                            isHost
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : node.type === 'cliente_mobile'
                              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                              : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                          }`}
                        >
                          {isHost ? (
                            <Server className="w-5 h-5" />
                          ) : node.type === 'cliente_mobile' ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Laptop className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-white truncate">{node.name}</h4>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                                isHost
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                  : 'border-slate-700 bg-slate-800 text-slate-300'
                              }`}
                            >
                              {isHost ? 'Host Central' : node.type === 'cliente_mobile' ? 'Mobile' : 'Desktop'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {node.platform} • IP: <span className="font-mono text-slate-300">{node.ip}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                node.status === 'online'
                                  ? 'bg-emerald-400 animate-pulse'
                                  : node.status === 'ocioso'
                                  ? 'bg-amber-400'
                                  : 'bg-slate-600'
                              }`}
                            />
                            <span className="text-[11px] font-semibold text-slate-300 capitalize">
                              {node.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {node.latencyMs}ms • {node.syncedItemsCount} itens
                          </p>
                        </div>

                        {!isHost && (
                          <button
                            onClick={() => onDisconnectNode(node.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                            title="Desconectar este nó cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instructions Guide */}
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Como conectar outros computadores como clientes:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed pl-1">
                  <li>No outro computador ou celular, abra o NexusSync no navegador ou aplicativo PWA instalado.</li>
                  <li>Alterne para a aba "Servidor &amp; Rede" e selecione "Modo Cliente Remoto".</li>
                  <li>Insira o endereço deste servidor e o Token de Pareamento exibido acima.</li>
                  <li>Clique em "Testar Conexão e Parear" para sincronização contínua e bidirecional.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CLIENT MODE INTERFACE */
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Conectar a um Servidor NexusSync Remoto</h2>
              <p className="text-xs text-slate-400">
                Insira o endereço do servidor central para unificar seus dados em rede local ou na nuvem.
              </p>
            </div>
          </div>

          <form onSubmit={handleConnectClient} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome de Identificação deste Dispositivo
              </label>
              <input
                type="text"
                required
                value={clientDeviceName}
                onChange={(e) => setClientDeviceName(e.target.value)}
                placeholder="Ex: Notebook Engenharia / MacBook Escritório"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Endereço URL do Servidor Host Central
              </label>
              <input
                type="text"
                required
                value={clientServerUrl}
                onChange={(e) => setClientServerUrl(e.target.value)}
                placeholder="Ex: https://ais-dev-... ou http://192.168.1.100:3000"
                className="w-full font-mono rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Token de Pareamento Fornecido pelo Servidor
              </label>
              <input
                type="text"
                required
                value={clientToken}
                onChange={(e) => setClientToken(e.target.value.toUpperCase())}
                placeholder="Ex: NEXUS-XXXX-SYNC"
                className="w-full font-mono uppercase tracking-widest rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setClientDeviceType('desktop')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition ${
                  clientDeviceType === 'desktop'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Computador Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setClientDeviceType('mobile')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition ${
                  clientDeviceType === 'mobile'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Dispositivo Mobile</span>
              </button>
            </div>

            {pairingFeedback && (
              <div
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs ${
                  pairingFeedback.success
                    ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-950/40 text-rose-300'
                }`}
              >
                {pairingFeedback.success ? <Check className="w-4 h-4 shrink-0" /> : <Activity className="w-4 h-4 shrink-0" />}
                <span>{pairingFeedback.message}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPairing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/25 hover:from-cyan-500 hover:to-indigo-500 transition disabled:opacity-50"
              >
                <Link2 className="w-4 h-4" />
                <span>{isPairing ? 'Testando Conexão e Pareando...' : 'Conectar e Iniciar Sincronização'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
