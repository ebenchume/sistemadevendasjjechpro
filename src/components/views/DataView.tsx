import React, { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  X,
  HardDrive,
} from 'lucide-react';
import { ItemCategory, SyncItem, UserProfile } from '../../types';

interface DataViewProps {
  items: SyncItem[];
  activeUser: UserProfile;
  isOnline: boolean;
  isSyncing: boolean;
  queuedCount: number;
  onAddItem: (item: { title: string; category: ItemCategory; content: string }) => void;
  onUpdateItem: (id: string, updates: Partial<SyncItem>) => void;
  onDeleteItem: (id: string) => void;
  onSyncNow: () => void;
}

export const DataView: React.FC<DataViewProps> = ({
  items,
  activeUser,
  isOnline,
  isSyncing,
  queuedCount,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onSyncNow,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ItemCategory>('documento');
  const [formContent, setFormContent] = useState('');

  const openCreateModal = () => {
    setEditingItemId(null);
    setFormTitle('');
    setFormCategory('documento');
    setFormContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: SyncItem) => {
    setEditingItemId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormContent(item.content);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    if (editingItemId) {
      onUpdateItem(editingItemId, {
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        version: (items.find((i) => i.id === editingItemId)?.version || 1) + 1,
        updatedAt: new Date().toISOString(),
        author: activeUser.name,
        authorEmail: activeUser.email,
        sizeBytes: formTitle.length + formContent.length * 2,
      });
    } else {
      onAddItem({
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'documento', label: 'Documentos' },
    { id: 'tarefa', label: 'Tarefas' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'configuracao', label: 'Configurações' },
    { id: 'nota', label: 'Notas' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-400" />
            Dados &amp; Sincronização em Nuvem
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie registros distribuídos. Modificações offline são armazenadas em fila segura e sincronizadas
            automaticamente.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Nuvem'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-500 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Registro</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por título, conteúdo ou autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Banner if any pending items */}
      {queuedCount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{queuedCount} registro(s)</strong> criados ou editados offline aguardando sincronização com o
              servidor central.
            </span>
          </div>
          {isOnline && (
            <button
              onClick={onSyncNow}
              className="rounded-lg bg-amber-600 px-3 py-1 font-bold text-white hover:bg-amber-500 transition"
            >
              Enviar Agora
            </button>
          )}
        </div>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const categoryColors = {
            documento: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
            tarefa: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
            seguranca: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
            configuracao: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
            nota: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
          };

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition shadow-sm group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      categoryColors[item.category] || categoryColors.documento
                    }`}
                  >
                    {item.category}
                  </span>

                  <span
                    className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.status === 'sincronizado'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {item.status === 'sincronizado' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Nuvem OK
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-400" />
                        Pendente
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {item.content}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="truncate max-w-[150px]">
                  <span>{item.author}</span>
                  <span className="mx-1">•</span>
                  <span>v{item.version}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Editar registro"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                    title="Excluir registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
            <FileText className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-300">Nenhum registro encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search ? 'Tente ajustar os filtros de busca.' : 'Crie seu primeiro registro sincronizado na nuvem.'}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              Criar Novo Registro
            </button>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-700/80 bg-slate-900 p-6 md:p-8 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingItemId ? 'Editar Registro' : 'Novo Registro Sincronizado'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Título do Registro
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Política de Backup Remoto dos Clientes"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ItemCategory)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="documento">Documento</option>
                  <option value="tarefa">Tarefa</option>
                  <option value="seguranca">Segurança &amp; Auditoria</option>
                  <option value="configuracao">Configuração de Servidor</option>
                  <option value="nota">Nota Rápida</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Conteúdo / Dados
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva as instruções, credenciais, metadados ou conteúdo deste registro..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400">
                <span>Autor: </span>
                <strong className="text-white">{activeUser.name}</strong> ({activeUser.role}) • Sincronização
                automática com garantia de versão FIDO2.
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-500 transition"
                >
                  {editingItemId ? 'Salvar Alterações' : 'Salvar & Sincronizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
