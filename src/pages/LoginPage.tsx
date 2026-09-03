import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { UnitLogo } from '../components/common/UnitLogo';
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials, loginWithGoogle, firebaseUser } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [showAccountsGuide, setShowAccountsGuide] = useState(false);

  const referenceAccounts: { role: Role; label: string; desc: string; username: string; pass: string }[] = [
    { role: 'CO', label: 'CO', desc: 'Commanding Officer', username: 'co', pass: 'co123' },
    { role: 'RSM', label: 'RSM', desc: 'Regimental Sgt Major', username: 'rsm', pass: 'rsm123' },
    { role: 'Admin', label: 'Admin', desc: 'IT Administrator', username: 'admin', pass: 'admin123' },
    { role: 'Offr', label: 'Offr', desc: 'Regimental Officer', username: 'offr', pass: 'offr123' },
    { role: 'HQ BSM', label: 'HQ BSM', desc: 'HQ Battery BSM', username: 'hq_bsm', pass: 'bsm123' },
    { role: 'P BSM', label: 'P BSM', desc: 'P Battery BSM', username: 'p_bsm', pass: 'bsm123' },
    { role: 'Q BSM', label: 'Q BSM', desc: 'Q Battery BSM', username: 'q_bsm', pass: 'bsm123' },
    { role: 'R BSM', label: 'R BSM', desc: 'R Battery BSM', username: 'r_bsm', pass: 'bsm123' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = loginWithCredentials(username, password);
    if (!result.success) {
      setErrorMessage(result.error || 'ভুল ইউজারনেম বা পাসওয়ার্ড। দয়া করে পুনরায় চেষ্টা করুন।');
    }
  };

  const handleSelectReferenceAccount = (acc: typeof referenceAccounts[0]) => {
    setUsername(acc.username);
    setPassword(acc.pass);
    setErrorMessage(null);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      console.error(e);
      setErrorMessage('Google Authentication failed: ' + (e?.message || 'Error'));
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Military Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Unit Emblem & Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <UnitLogo size="xl" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-sans">
              10 MED REGT ARTY
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Born Destroyer
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Smart Dashboard
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Secure Personnel & Parade State Management Gateway
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Service ID / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your username (e.g. co, rsm, admin)"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Security Passkey / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
                title={showPassword ? 'Hide password' : 'View password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Authenticate & Enter Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Optional Google Authentication */}
        <div className="space-y-2">
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-mono tracking-wider text-slate-500">
              or sign in with
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningInGoogle}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-white font-medium text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isSigningInGoogle ? 'Connecting with Google...' : 'Google Account Access'}</span>
          </button>
        </div>

        {/* Collapsible Test Credentials Reference (For User Guidance) */}
        <div className="pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowAccountsGuide(!showAccountsGuide)}
            className="w-full flex items-center justify-between text-left text-[11px] text-slate-400 hover:text-slate-200 py-1 font-mono transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Default User Accounts & Credentials</span>
            </span>
            {showAccountsGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAccountsGuide && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs animate-in fade-in">
              <p className="text-[10px] text-slate-400 font-mono">
                Click any role below to auto-fill username & password for testing:
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {referenceAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectReferenceAccount(acc)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors flex flex-col"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-rose-300 font-mono">{acc.label}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{acc.pass}</span>
                    </div>
                    <span className="text-[10px] text-slate-300 truncate">ID: {acc.username}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>CONFIDENTIAL • 10 MED REGT ARTY MILITARY USE ONLY</span>
        </div>
      </div>
    </div>
  );
};
