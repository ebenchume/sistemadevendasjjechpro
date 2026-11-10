import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Check,
  Trash2,
  Edit3,
  Fingerprint,
  Mail,
  Calendar,
  X,
  UserCheck,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

interface AccountsViewProps {
  users: UserProfile[];
  activeUser: UserProfile;
  onSwitchUser: (userId: string) => void;
  onCreateUser: (newUser: Omit<UserProfile, 'id' | 'createdAt' | 'lastActive'>) => void;
  onUpdateUser: (userId: string, updates: Partial<UserProfile>) => void;
  onDeleteUser: (userId: string) => void;
}

const COLOR_PRESETS = [
  { id: 'blue', gradient: 'from-blue-600 to-indigo-600', label: 'Azul Índigo' },
  { id: 'emerald', gradient: 'from-emerald-600 to-teal-600', label: 'Verde Esmeralda' },
  { id: 'purple', gradient: 'from-violet-600 to-purple-600', label: 'Violeta Tecnológico' },
  { id: 'rose', gradient: 'from-rose-600 to-pink-600', label: 'Rosa Coral' },
  { id: 'amber', gradient: 'from-amber-600 to-orange-600', label: 'Âmbar Dourado' },
  { id: 'cyan', gradient: 'from-cyan-600 to-sky-600', label: 'Ciano Neônio' },
];

export const AccountsView: React.FC<AccountsViewProps> = ({
  users,
  activeUser,
  onSwitchUser,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Operador');
  const [pin, setPin] = useState('1234');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].gradient);
  const [enrollBiometrics, setEnrollBiometrics] = useState(true);

  // Edit user form state
  const [editName, setEditName] = useState(activeUser.name);
  const [editRole, setEditRole] = useState<UserRole>(activeUser.role);
  const [editColor, setEditColor] = useState(activeUser.color);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onCreateUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      avatar: name.trim().charAt(0).toUpperCase(),
      color: selectedColor,
      pin: pin || '1234',
      biometricEnrolled: enrollBiometrics,
      biometricCredentialId: enrollBiometrics ? 'cred-bio-' + Date.now() : undefined,
    });

    setName('');
    setEmail('');
    setPin('1234');
    setIsCreateOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    onUpdateUser(activeUser.id, {
      name: editName.trim(),
      role: editRole,
      color: editColor,
      avatar: editName.trim().charAt(0).toUpperCase(),
    });

    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-400" />
            Contas, Perfis &amp; Múltiplos Usuários
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Crie novos perfis, alterne entre contas e personalize credenciais de acesso para esta estação de trabalho.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-500 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Criar Novo Usuário</span>
        </button>
      </div>

      {/* Active User Highlight Profile Card */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900 to-indigo-950/30 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${activeUser.color} text-white font-extrabold text-2xl md:text-3xl shadow-xl shadow-indigo-500/20`}
            >
              {activeUser.avatar || activeUser.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-xl font-bold text-white">{activeUser.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Conta Atual
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeUser.email}</span>
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-200">{activeUser.role}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Fingerprint className="w-3 h-3" />
                  {activeUser.biometricEnrolled ? 'Biometria Vinculada' : 'PIN Ativo'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditName(activeUser.name);
                setEditRole(activeUser.role);
                setEditColor(activeUser.color);
                setIsEditOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Perfil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Accounts Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Todas as Contas Configuradas ({users.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const isCurrent = user.id === activeUser.id;
            return (
              <div
                key={user.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition shadow-sm ${
                  isCurrent
                    ? 'border-indigo-500/50 bg-indigo-950/20 shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${user.color} text-white font-bold text-base shadow`}
                    >
                      {user.avatar || user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Fingerprint className="w-3 h-3 text-emerald-400" />
                    <span>{user.biometricEnrolled ? 'FIDO2' : 'PIN'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCurrent && (
                      <button
                        onClick={() => onSwitchUser(user.id)}
                        className="rounded-lg bg-indigo-600/80 hover:bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white transition"
                      >
                        Alternar
                      </button>
                    )}

                    {users.length > 1 && !isCurrent && (
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        title="Excluir perfil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Create User */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Criar Novo Usuário</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gabriela Costa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">E-mail de Acesso</label>
                <input
                  type="email"
                  required
                  placeholder="gabriela.costa@nexussync.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cargo / Função</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Engenheiro">Engenheiro</option>
                    <option value="Operador">Operador</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">PIN Inicial (4 dígitos)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full font-mono text-center tracking-widest rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Color Preset Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cor do Perfil e Avatar
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.gradient)}
                      className={`h-7 w-7 rounded-xl bg-gradient-to-tr ${c.gradient} transition-transform ${
                        selectedColor === c.gradient ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Biometrics Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300">Vincular autenticação biométrica</span>
                </div>
                <input
                  type="checkbox"
                  checked={enrollBiometrics}
                  onChange={(e) => setEnrollBiometrics(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2 text-xs font-bold text-white hover:from-indigo-500 hover:to-cyan-500"
                >
                  Criar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Active User */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Editar Perfil</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cargo / Função</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Engenheiro">Engenheiro</option>
                  <option value="Operador">Operador</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Cor do Avatar</label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditColor(c.gradient)}
                      className={`h-7 w-7 rounded-xl bg-gradient-to-tr ${c.gradient} transition-transform ${
                        editColor === c.gradient ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
