import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  HardDrive,
  Activity,
  ShieldCheck,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ConnectedNode, SecurityAudit, SyncItem, SyncStatsSummary } from '../../types';

interface StatsViewProps {
  items: SyncItem[];
  nodes: ConnectedNode[];
  audits: SecurityAudit[];
  statsSummary: SyncStatsSummary | null;
}

export const StatsView: React.FC<StatsViewProps> = ({
  items,
  nodes,
  audits,
  statsSummary,
}) => {
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [exportedStatus, setExportedStatus] = useState<string | null>(null);

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  items.forEach((item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  const totalBytes = items.reduce((acc, i) => acc + (i.sizeBytes || 1024), 0);
  const formattedStorage = (totalBytes / 1024).toFixed(1) + ' KB';

  // Activity timeline mock based on period
  const activityData =
    period === '24h'
      ? [
          { label: '00h', syncs: 4, errors: 0 },
          { label: '04h', syncs: 2, errors: 0 },
          { label: '08h', syncs: 14, errors: 0 },
          { label: '12h', syncs: 28, errors: 0 },
          { label: '16h', syncs: 32, errors: 1 },
          { label: '20h', syncs: 19, errors: 0 },
        ]
      : period === '7d'
      ? [
          { label: 'Seg', syncs: 45, errors: 0 },
          { label: 'Ter', syncs: 62, errors: 1 },
          { label: 'Qua', syncs: 58, errors: 0 },
          { label: 'Qui', syncs: 71, errors: 0 },
          { label: 'Sex', syncs: 84, errors: 0 },
          { label: 'Sáb', syncs: 39, errors: 0 },
          { label: 'Dom', syncs: 26, errors: 0 },
        ]
      : [
          { label: 'Semana 1', syncs: 290, errors: 2 },
          { label: 'Semana 2', syncs: 345, errors: 1 },
          { label: 'Semana 3', syncs: 412, errors: 3 },
          { label: 'Semana 4', syncs: 388, errors: 0 },
        ];

  const maxSyncVal = Math.max(...activityData.map((d) => d.syncs), 10);

  // Export JSON
  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      system: 'NexusSync v2.5',
      items,
      nodes,
      audits,
      stats: statsSummary,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexussync-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedStatus('Backup JSON exportado com sucesso!');
    setTimeout(() => setExportedStatus(null), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Título', 'Categoria', 'Autor', 'E-mail', 'Versão', 'Data Atualização', 'Status', 'Tamanho Bytes'];
    const rows = items.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      `"${i.author.replace(/"/g, '""')}"`,
      i.authorEmail,
      i.version,
      i.updatedAt,
      i.status,
      i.sizeBytes,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexussync-dados-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedStatus('Planilha CSV gerada com sucesso!');
    setTimeout(() => setExportedStatus(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Export controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Painel de Estatísticas &amp; Telemetria
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas de tráfego em nuvem, latência de rede, distribuição de armazenamento e auditoria biométrica.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-500 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON Completo</span>
          </button>
        </div>
      </div>

      {exportedStatus && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportedStatus}</span>
        </div>
      )}

      {/* Top 4 KPI metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Taxa de Sucesso de Sync</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">99.8%</span>
            <span className="text-xs text-slate-400">0.2% latência</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '99.8%' }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Volume de Dados em Nuvem</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{formattedStorage}</span>
            <span className="text-xs text-indigo-400">{items.length} registros</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '42%' }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Latência Média de Rede</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400">
              {statsSummary?.averageLatencyMs || 18.4} ms
            </span>
            <span className="text-xs text-slate-400">{nodes.length} nós ativos</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '22%' }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Validação Biométrica</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-400">100%</span>
            <span className="text-xs text-slate-400">Zero falhas</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Sync Activity Timeline SVG Chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Eventos de Sincronização e Tráfego
            </h3>
            <p className="text-xs text-slate-400">Frequência de trocas de dados entre servidor e clientes</p>
          </div>

          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
            {(['24h', '7d', '30d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  period === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === '24h' ? 'Últimas 24h' : p === '7d' ? '7 Dias' : '30 Dias'}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4">
          <div className="h-48 w-full flex items-end gap-3 sm:gap-6 px-2">
            {activityData.map((d, idx) => {
              const heightPct = Math.max(12, Math.round((d.syncs / maxSyncVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.syncs} syncs
                  </span>
                  <div className="w-full max-w-[48px] bg-slate-800/80 rounded-t-xl overflow-hidden flex flex-col justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2 Cols: Category Breakdown & Client Nodes Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Distribuição por Categoria
            </h3>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { key: 'documento', label: 'Documentos', color: 'bg-blue-500' },
              { key: 'tarefa', label: 'Tarefas', color: 'bg-emerald-500' },
              { key: 'seguranca', label: 'Segurança & Auditoria', color: 'bg-purple-500' },
              { key: 'configuracao', label: 'Configurações de Rede', color: 'bg-amber-500' },
              { key: 'nota', label: 'Notas Rápidas', color: 'bg-cyan-500' },
            ].map((cat) => {
              const count = categoryCounts[cat.key] || 0;
              const pct = items.length > 0 ? Math.round((count / items.length) * 100) : 0;

              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{cat.label}</span>
                    <span className="font-semibold text-white">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Latencies */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Latência dos Clientes Conectados
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-3"
              >
                <div>
                  <p className="text-xs font-bold text-white truncate">{node.name}</p>
                  <p className="text-[10px] text-slate-400">{node.platform}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-cyan-400">{node.latencyMs} ms</span>
                  <p className="text-[10px] text-emerald-400">{node.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Audit Log Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Registro de Auditoria de Acesso &amp; Biometria
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">{audits.length} eventos registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 pr-4">Horário</th>
                <th className="py-2.5 px-4">Usuário / Origem</th>
                <th className="py-2.5 px-4">Evento</th>
                <th className="py-2.5 px-4">Método</th>
                <th className="py-2.5 pl-4 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 pr-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-4 text-slate-200 font-medium whitespace-nowrap">
                    {a.userEmail}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{a.event}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                      {a.method}
                    </span>
                  </td>
                  <td className="py-2.5 pl-4 text-right whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.success
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {a.success ? 'Autorizado' : 'Rejeitado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
