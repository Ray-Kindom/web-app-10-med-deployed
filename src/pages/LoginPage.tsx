import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAccount } from '../types';
import { UnitLogo } from '../components/common/UnitLogo';
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  X,
  KeyRound,
  Cloud,
  UserCheck,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { usersList, loginWithCredentials, loginWithGoogle } = useApp();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fallback direct login form toggle for manual input if needed
  const [manualLogin, setManualLogin] = useState(false);
  const [manualUsername, setManualUsername] = useState('');
  const [manualPassword, setManualPassword] = useState('');

  // Group or order users: CO, Offr, RSM, P BSM, Q BSM, R BSM, HQ BSM, Admin, followed by custom additions
  const roleRankOrder = ['CO', 'Offr', 'RSM', 'P BSM', 'Q BSM', 'R BSM', 'HQ BSM', 'Admin'];

  const sortedUsers = [...usersList]
    .filter((u) => u.role !== 'Guest' && u.username.toLowerCase() !== 'guest')
    .sort((a, b) => {
      const orderA = roleRankOrder.indexOf(a.role);
      const orderB = roleRankOrder.indexOf(b.role);
      const weightA = orderA === -1 ? 99 : orderA;
      const weightB = orderB === -1 ? 99 : orderB;
      if (weightA !== weightB) return weightA - weightB;
      return (a.name || '').localeCompare(b.name || '');
    });

  const handleGuestLogin = () => {
    setErrorMessage(null);
    const result = loginWithCredentials('Guest', 'guest123');
    if (!result.success) {
      setErrorMessage(result.error || 'গেস্ট লগইন করতে সমস্যা হয়েছে।');
    }
  };

  const handleOpenPasswordModal = (user: UserAccount) => {
    setSelectedUser(user);
    setPassword('');
    setShowPassword(false);
    setErrorMessage(null);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMessage(null);

    const result = loginWithCredentials(selectedUser.username, password);
    if (!result.success) {
      setErrorMessage(result.error || 'ভুল পাসওয়ার্ড। দয়া করে পুনরায় চেষ্টা করুন।');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = loginWithCredentials(manualUsername, manualPassword);
    if (!result.success) {
      setErrorMessage(result.error || 'ভুল ইউজারনেম বা পাসওয়ার্ড।');
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return '10M';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Unit Emblem & Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <UnitLogo size="xl" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-sans">
            10 MED REGT ARTY
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Born Destroyer
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Smart Dashboard
            </span>
          </div>
        </div>

        {/* Large Clearly Visible Guest Login Box / Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 border-2 border-amber-500/60 p-5 sm:p-6 shadow-2xl shadow-amber-950/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  READ-ONLY DEMO MODE
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Full Regimental Visibility
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide font-mono flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
                  <span>GUEST LOGIN</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  প্যারেড স্টেট, রোল সিমুলেটর, নোমিনাল রোল, ডিউটি রোস্টার এবং রেজিমেন্টের সকল ডেটা রিড-অনলি মোডে পর্যবেক্ষণ করতে গেস্ট হিসেবে প্রবেশ করুন।
                </p>
              </div>

              {/* Display Credentials */}
              <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-xs">
                <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-700/90 px-3.5 py-1.5 rounded-xl shadow-inner">
                  <span className="text-slate-400 font-semibold">Username:</span>
                  <code className="text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 text-xs sm:text-sm">
                    Guest
                  </code>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-700/90 px-3.5 py-1.5 rounded-xl shadow-inner">
                  <span className="text-slate-400 font-semibold">Password:</span>
                  <code className="text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 text-xs sm:text-sm">
                    guest123
                  </code>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <UserCheck className="w-5 h-5 text-slate-950" />
                <span>Login as Guest</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>

        {/* Login As Section Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
              Login As
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setManualLogin(!manualLogin)}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-mono"
          >
            {manualLogin ? 'Select from User List' : 'Direct Username Login'}
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && !selectedUser && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* User Card Grid */}
        {!manualLogin ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {sortedUsers.map((user) => {
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleOpenPasswordModal(user)}
                  className="group relative flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/50 text-left transition-all duration-150 cursor-pointer shadow-sm hover:shadow-rose-950/20"
                >
                  {/* Photo or Name Initials */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-rose-500/40 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 group-hover:border-rose-500/60 flex items-center justify-center text-xs font-mono font-bold text-amber-300 flex-shrink-0">
                      {getUserInitials(user.name)}
                    </div>
                  )}

                  {/* Name & Role Details */}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-100 group-hover:text-white truncate">
                      {user.rank} {user.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-semibold text-rose-400">
                        {user.role}
                      </span>
                      {user.assignedBattery && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1 rounded">
                          {user.assignedBattery}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-400 transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          /* Manual Username / Password Form */
          <form onSubmit={handleManualSubmit} className="space-y-4 max-w-md mx-auto py-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username / Service ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  placeholder="e.g. admin, co, rsm"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Authenticate & Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Google Cloud Sign-In Option */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              setIsGoogleLoading(true);
              setErrorMessage(null);
              try {
                const res = await loginWithGoogle();
                if (!res.success && res.code === 'auth/unauthorized-domain') {
                  const domain = res.domain || (typeof window !== 'undefined' ? window.location.hostname : '');
                  setUnauthorizedDomain(domain);
                } else if (!res.success && res.code !== 'auth/popup-closed-by-user') {
                  setErrorMessage(res.error || 'গুগল লগইন সম্পন্ন করা সম্ভব হয়নি।');
                }
              } catch (e: any) {
                if (e?.code === 'auth/unauthorized-domain') {
                  setUnauthorizedDomain(typeof window !== 'undefined' ? window.location.hostname : '');
                } else if (e?.code !== 'auth/popup-closed-by-user') {
                  setErrorMessage(e?.message || 'গুগল লগইন সম্পন্ন করা সম্ভব হয়নি।');
                }
              } finally {
                setIsGoogleLoading(false);
              }
            }}
            disabled={isGoogleLoading}
            className="w-full max-w-sm py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google (Firebase Cloud)'}</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="pt-2 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>CONFIDENTIAL • 10 MED REGT ARTY MILITARY USE ONLY</span>
        </div>
      </div>

      {/* Domain Authorization Helper Modal */}
      {unauthorizedDomain && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setUnauthorizedDomain(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Firebase Domain Authorization Required
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  গুগল ফায়ারবেস সিকিউরিটির কারণে বর্তমান ক্লাউড প্রিভিউ ডোমেইনটি Firebase Console-এর Authorized Domains তালিকায় যুক্ত থাকতে হয়।
                </p>
              </div>
            </div>

            {/* Quick 1-Click Bypass to Admin */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                <Sparkles className="w-4 h-4" />
                <span>তাত্ক্ষণিক অ্যাডমিন অ্যাক্সেস (Recommended)</span>
              </div>
              <p className="text-xs text-slate-300">
                ডোমেইন কনফিগারেশন ছাড়াই সরাসরি ফুল অ্যাডমিন হিসেবে প্রবেশ করতে নিচের বাটনে চাপুন:
              </p>
              <button
                type="button"
                onClick={() => {
                  setUnauthorizedDomain(null);
                  const result = loginWithCredentials('admin', 'admin123');
                  if (!result.success) {
                    setErrorMessage(result.error || 'অ্যাডমিন লগইন করতে সমস্যা হয়েছে।');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-900/30"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Continue as Regimental Admin (One-Click)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-step Whitelist Instructions */}
            <div className="space-y-2.5 pt-1">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>বর্তমান ডোমেইন (Current Host):</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(unauthorizedDomain);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2500);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors"
                >
                  {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDomain ? 'Copied to Clipboard!' : 'Copy Domain'}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-amber-300 break-all select-all flex items-center justify-between">
                <span>{unauthorizedDomain}</span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1.5 pt-1 font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <p className="font-semibold text-slate-300">Firebase Console-এ ডোমেইন যুক্ত করার নিয়ম:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Firebase Console (<a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-rose-400 underline inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-2.5 h-2.5 inline" /></a>) ওপেন করুন।</li>
                  <li>প্রজেক্ট <strong>gen-lang-client-0581671896</strong> বেছে নিয়ে <strong>Authentication</strong> → <strong>Settings</strong> ট্যাবে যান।</li>
                  <li><strong>Authorized domains</strong> সেকশনে <strong>Add domain</strong>-এ ক্লিক করে উপরের ডোমেইনটি পেস্ট করে সেভ করুন।</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setUnauthorizedDomain(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal when a user card is clicked */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setErrorMessage(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Selected User Identity */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full border-2 border-rose-500 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-mono font-bold text-amber-300">
                  {getUserInitials(selectedUser.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">
                  {selectedUser.rank} {selectedUser.name}
                </div>
                <div className="text-xs text-rose-400 font-mono font-semibold">
                  {selectedUser.role} {selectedUser.assignedBattery ? `• ${selectedUser.assignedBattery}` : ''}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  পাসওয়ার্ড লিখুন (Enter Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  <span>Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
