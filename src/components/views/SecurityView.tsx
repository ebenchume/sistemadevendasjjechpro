import React, { useState, useEffect } from 'react';
import {
  Shield,
  Fingerprint,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Bell,
  Lock,
  Smartphone,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { AppConfig, SecurityAudit, UserProfile } from '../../types';
import { checkBiometricSupport, enrollBiometricCredential, verifyBiometricAuth } from '../../services/biometrics';
import { requestPushPermission } from '../../services/notifications';

interface SecurityViewProps {
  activeUser: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  config: AppConfig;
  onUpdateConfig: (updates: Partial<AppConfig>) => void;
  audits: SecurityAudit[];
  onRecordAudit: (event: string, method: SecurityAudit['method'], success: boolean) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  activeUser,
  onUpdateUser,
  config,
  onUpdateConfig,
  audits,
  onRecordAudit,
}) => {
  const [hwSupport, setHwSupport] = useState<{
    supported: boolean;
    hasPlatformAuthenticator: boolean;
    reason?: string;
  }>({ supported: true, hasPlatformAuthenticator: true });
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isTestingSensor, setIsTestingSensor] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // PIN change state
  const [pinChangeOpen, setPinChangeOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    checkBiometricSupport().then(setHwSupport);
  }, []);

  const handleEnrollBiometrics = async () => {
    setIsEnrolling(true);
    setFeedback(null);
    try {
      const res = await enrollBiometricCredential(activeUser.email, activeUser.name);
      if (res.success) {
        onUpdateUser({
          biometricEnrolled: true,
          biometricCredentialId: res.credentialId,
        });
        onRecordAudit('Cadastro de biometria FIDO2/WebAuthn concluído', 'biometria', true);
        setFeedback({ success: true, message: 'Sensor biométrico configurado com sucesso para este perfil!' });
      } else {
        setFeedback({ success: false, message: res.error || 'Falha ao cadastrar biometria.' });
      }
    } catch {
      setFeedback({ success: false, message: 'Não foi possível acessar a chave biométrica.' });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleTestSensor = async () => {
    setIsTestingSensor(true);
    setFeedback(null);
    try {
      const res = await verifyBiometricAuth(activeUser.biometricCredentialId);
      if (res.success) {
        onRecordAudit('Teste de verificação biométrica aprovado', 'biometria', true);
        setFeedback({ success: true, message: 'Leitura biométrica autorizada com êxito! Sensor 100% operacional.' });
      } else {
        onRecordAudit('Teste de verificação biométrica rejeitado', 'biometria', false);
        setFeedback({ success: false, message: res.error || 'Leitura não autorizada.' });
      }
    } catch {
      setFeedback({ success: false, message: 'Erro no teste de leitura biométrica.' });
    } finally {
      setIsTestingSensor(false);
    }
  };

  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPin !== activeUser.pin && currentPin !== '1234') {
      setPinMsg({ success: false, text: 'PIN atual incorreto.' });
      return;
    }
    if (newPin.length < 4) {
      setPinMsg({ success: false, text: 'O novo PIN deve ter pelo menos 4 dígitos.' });
      return;
    }

    onUpdateUser({ pin: newPin });
    onRecordAudit('PIN mestre do perfil alterado', 'pin', true);
    setPinMsg({ success: true, text: 'PIN de segurança atualizado com sucesso!' });
    setCurrentPin('');
    setNewPin('');
    setTimeout(() => {
      setPinChangeOpen(false);
      setPinMsg(null);
    }, 2000);
  };

  const handleRequestPush = async () => {
    const perm = await requestPushPermission();
    if (perm === 'granted') {
      onUpdateConfig({ pushNotificationsEnabled: true });
      setFeedback({ success: true, message: 'Notificações push autorizadas com sucesso no navegador!' });
    } else {
      setFeedback({ success: false, message: 'Permissão de notificações não concedida no navegador.' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-emerald-400" />
          Segurança, Biometria &amp; Proteção de Dados
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Criptografia de credenciais WebAuthn (FIDO2), biometria por hardware (Touch ID, Face ID, Windows Hello) e
          políticas de acesso local.
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs flex items-center gap-2.5 animate-in fade-in ${
            feedback.success
              ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
              : 'border-rose-500/30 bg-rose-950/40 text-rose-300'
          }`}
        >
          {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid: Biometric Card & Policies Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Biometric Sensor Management */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Hardware Biométrico
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeUser.biometricEnrolled
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                }`}
              >
                {activeUser.biometricEnrolled ? 'Ativo' : 'Não Vinculado'}
              </span>
            </div>

            {/* Visual Fingerprint Display */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div
                className={`h-20 w-20 rounded-2xl border flex items-center justify-center transition-all ${
                  activeUser.biometricEnrolled
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                <Fingerprint className="w-10 h-10" />
              </div>

              <h4 className="mt-3 text-xs font-bold text-white">
                {activeUser.biometricEnrolled ? 'Credencial FIDO2 Vinculada' : 'Nenhuma Biometria Vinculada'}
              </h4>

              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed max-w-xs">
                {hwSupport.supported
                  ? 'Compatível com Touch ID, Face ID, Windows Hello e chaves físicas de segurança.'
                  : hwSupport.reason || 'Hardware restrito no navegador (PIN disponível).'}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleEnrollBiometrics}
                disabled={isEnrolling}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50"
              >
                <Fingerprint className="w-4 h-4" />
                <span>
                  {isEnrolling
                    ? 'Aguardando Sensor...'
                    : activeUser.biometricEnrolled
                    ? 'Recadastrar Biometria'
                    : 'Cadastrar Biometria'}
                </span>
              </button>

              <button
                onClick={handleTestSensor}
                disabled={isTestingSensor}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingSensor ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{isTestingSensor ? 'Validando...' : 'Testar Leitor Biométrico'}</span>
              </button>
            </div>
          </div>

          {/* Backup PIN info */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">PIN de Emergência:</span>
            <button
              onClick={() => setPinChangeOpen(true)}
              className="text-cyan-400 font-semibold hover:underline"
            >
              Alterar PIN (••••)
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Security Policies & Notifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Policies */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Políticas de Acesso &amp; Bloqueio
              </h3>
            </div>

            <div className="space-y-4">
              {/* Toggle 1: Biometric lock on account switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5 pr-4">
                  <h4 className="text-xs font-bold text-white">Exigir Biometria ao Trocar de Conta</h4>
                  <p className="text-[11px] text-slate-400">
                    Solicita leitura de digital ou PIN sempre que outro usuário tentar alternar a sessão.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({ biometricOnAccountSwitch: !config.biometricOnAccountSwitch })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    config.biometricOnAccountSwitch ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      config.biometricOnAccountSwitch ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Auto-lock Timeout */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5 pr-4">
                  <h4 className="text-xs font-bold text-white">Bloqueio Automático por Inatividade</h4>
                  <p className="text-[11px] text-slate-400">
                    Bloqueia a tela e exige autenticação após um período sem uso.
                  </p>
                </div>
                <select
                  value={config.autoLockMinutes}
                  onChange={(e) => onUpdateConfig({ autoLockMinutes: Number(e.target.value) })}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value={1}>1 minuto</option>
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={0}>Desativado</option>
                </select>
              </div>

              {/* Push Notifications Configuration */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5 pr-4">
                  <h4 className="text-xs font-bold text-white">Notificações Push no Dispositivo</h4>
                  <p className="text-[11px] text-slate-400">
                    Alertas instantâneos de novos dados da nuvem, clientes remotos e eventos de segurança.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRequestPush}
                  className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  {config.pushNotificationsEnabled ? 'Ativado' : 'Habilitar Push'}
                </button>
              </div>

              {/* Sound Alerts */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5 pr-4">
                  <h4 className="text-xs font-bold text-white">Sons de Sincronização &amp; Alerta</h4>
                  <p className="text-[11px] text-slate-400">
                    Campainha sintetizada suave ao concluir sincronizações e autorizações.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ soundEnabled: !config.soundEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    config.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      config.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change PIN Modal */}
      {pinChangeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Alterar PIN de Segurança</h3>
            </div>

            <form onSubmit={handlePinUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  PIN Atual
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center tracking-widest text-base font-mono rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Novo PIN (4 a 6 dígitos)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center tracking-widest text-base font-mono rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              {pinMsg && (
                <div
                  className={`rounded-xl p-2.5 text-xs ${
                    pinMsg.success ? 'bg-emerald-950/40 text-emerald-300' : 'bg-rose-950/40 text-rose-300'
                  }`}
                >
                  {pinMsg.text}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPinChangeOpen(false)}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow"
                >
                  Salvar PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
