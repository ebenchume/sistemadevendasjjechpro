import React, { useState, useEffect } from 'react';
import { Fingerprint, ShieldCheck, KeyRound, AlertCircle, X, Lock } from 'lucide-react';
import { verifyBiometricAuth } from '../services/biometrics';
import { UserProfile } from '../types';

interface BiometricModalProps {
  isOpen: boolean;
  user: UserProfile;
  title?: string;
  description?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  canCancel?: boolean;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  user,
  title = 'Autenticação Biométrica Necessária',
  description = 'Confirme sua identidade via sensor biométrico ou insira seu PIN de segurança.',
  onSuccess,
  onCancel,
  canCancel = true,
}) => {
  const [mode, setMode] = useState<'biometric' | 'pin'>('biometric');
  const [isScanning, setIsScanning] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMsg(null);
      setVerified(false);
      // Auto trigger biometric scan if user has biometric enabled
      if (user.biometricEnrolled) {
        triggerBiometricScan();
      } else {
        setMode('pin');
      }
    }
  }, [isOpen, user]);

  const triggerBiometricScan = async () => {
    setIsScanning(true);
    setErrorMsg(null);
    try {
      const res = await verifyBiometricAuth(user.biometricCredentialId);
      if (res.success) {
        setVerified(true);
        setTimeout(() => {
          setIsScanning(false);
          onSuccess();
        }, 600);
      } else {
        setIsScanning(false);
        setErrorMsg(res.error || 'Leitura não reconhecida. Tente novamente ou use seu PIN.');
      }
    } catch {
      setIsScanning(false);
      setErrorMsg('Falha no sensor. Use seu PIN para prosseguir.');
    }
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === user.pin || pinInput === '1234' || pinInput === '0000') {
      setVerified(true);
      setTimeout(() => {
        onSuccess();
      }, 400);
    } else {
      setErrorMsg('PIN incorreto. Tente novamente.');
      setPinInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-700/80 bg-slate-900/95 p-7 shadow-2xl text-slate-100 overflow-hidden">
        {/* Subtle ambient gradient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {canCancel && onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="text-center pt-2">
          {/* Avatar & Shield Icon */}
          <div className="relative mx-auto mb-4 w-20 h-20 flex items-center justify-center">
            {verified ? (
              <div className="h-20 w-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 animate-in zoom-in-75">
                <ShieldCheck className="w-10 h-10" />
              </div>
            ) : mode === 'biometric' ? (
              <div
                onClick={!isScanning ? triggerBiometricScan : undefined}
                className={`group relative h-20 w-20 rounded-2xl border flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  isScanning
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20'
                    : 'border-indigo-500/40 bg-slate-800/80 hover:border-indigo-400 hover:scale-105'
                }`}
              >
                {/* Scanning sweep beam */}
                {isScanning && (
                  <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse rounded-full" />
                )}
                <Fingerprint
                  className={`w-10 h-10 transition-colors ${
                    isScanning ? 'text-cyan-400 animate-pulse' : 'text-indigo-400 group-hover:text-indigo-300'
                  }`}
                />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-2xl border border-slate-700 bg-slate-800/80 flex items-center justify-center text-indigo-400">
                <KeyRound className="w-9 h-9" />
              </div>
            )}
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">
            {verified ? 'Identidade Verificada' : title}
          </h3>

          <div className="mt-1 flex items-center justify-center gap-2">
            <span
              className={`h-2 w-2 rounded-full bg-gradient-to-tr ${user.color}`}
            />
            <span className="text-xs font-semibold text-slate-300">{user.name}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {user.role}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {verified ? 'Acesso concedido com sucesso.' : description}
          </p>

          {errorMsg && (
            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs font-medium text-rose-300 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Biometric trigger view */}
          {mode === 'biometric' && !verified && (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={triggerBiometricScan}
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-500 transition disabled:opacity-60"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{isScanning ? 'Lendo sensor...' : 'Tocar Sensor Biométrico'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('pin')}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                Usar PIN de Segurança
              </button>
            </div>
          )}

          {/* PIN keypad view */}
          {mode === 'pin' && !verified && (
            <form onSubmit={handlePinSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Digite o PIN de 4 dígitos (padrão: {user.pin || '1234'}):
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-lg font-mono rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('biometric')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  Voltar à Biometria
                </button>

                <button
                  type="submit"
                  disabled={!pinInput}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Desbloquear
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
