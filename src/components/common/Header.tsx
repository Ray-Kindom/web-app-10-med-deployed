import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UnitLogo } from './UnitLogo';
import { Role, Battery } from '../../types';
import {
  ShieldAlert,
  Clock,
  UserCheck,
  ChevronDown,
  Printer,
  Search,
  Bell,
  LogOut,
  Menu,
  Sparkles,
  Cloud,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileNav: () => void;
  onOpenPrintModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileNav,
  onOpenPrintModal,
}) => {
  const {
    currentUser,
    switchRole,
    searchQuery,
    setSearchQuery,
    setActivePage,
    notification,
    firebaseUser,
    isFirebaseReady,
    logout,
  } = useApp();

  const [militaryTime, setMilitaryTime] = useState<string>('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setMilitaryTime(`${day}-${month}-${year} ${hours}:${mins}:${secs} HRS`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const rolesList: { role: Role; label: string; bty?: Battery; desc: string }[] = [
    { role: 'CO', label: 'Commanding Officer (CO)', desc: 'Executive Strategic View' },
    { role: 'Offr', label: 'Officer (Offr)', desc: 'Regimental Officer Access' },
    { role: 'RSM', label: 'Regimental Sgt Major (RSM)', desc: 'Consolidated Muster & Enlistment' },
    { role: 'P BSM', label: 'P Battery Sgt Major (P BSM)', bty: 'P Bty', desc: 'P Battery In-Charge' },
    { role: 'Q BSM', label: 'Q Battery Sgt Major (Q BSM)', bty: 'Q Bty', desc: 'Q Battery In-Charge' },
    { role: 'R BSM', label: 'R Battery Sgt Major (R BSM)', bty: 'R Bty', desc: 'R Battery In-Charge' },
    { role: 'HQ BSM', label: 'HQ Battery Sgt Major (HQ BSM)', bty: 'HQ Bty', desc: 'HQ Battery In-Charge' },
    { role: 'Admin', label: 'System Admin', desc: 'User Roles & System Controls' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Banner alert if notification */}
      {notification && (
        <div className="bg-rose-600/90 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2 border-b border-rose-400/40">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Menu Button & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileNav}
              className="lg:hidden p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActivePage('main_dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <UnitLogo size="md" />
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 group-hover:text-white tracking-wide text-sm md:text-base font-sans leading-none">
                    10 Med Regt Arty
                  </span>
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded">
                    Born Destroyer
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Smart Parade State & Personnel Dashboard
                </span>
              </div>
            </div>
          </div>

          {/* Center: Search & Military Time */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Army/Snk No, Name, Rank, Trade..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Military Time, Role Selector, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Military Clock */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{militaryTime}</span>
            </div>

            {/* Quick Print Parade State */}
            {onOpenPrintModal && (
              <button
                onClick={onOpenPrintModal}
                title="Print Official Morning Parade State"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Print State</span>
              </button>
            )}

            {/* Role Switcher Dropdown - RESTRICTED TO ADMIN ONLY */}
            {currentUser.role === 'Admin' && (
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  title="Admin Role Simulation"
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-850 hover:to-slate-750 border border-slate-700 text-xs font-medium text-slate-200 shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold text-amber-300">Simulate: {currentUser.role}</span>
                  {currentUser.assignedBattery && (
                    <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                      [{currentUser.assignedBattery}]
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200 divide-y divide-slate-800">
                    <div className="px-3 py-2 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Simulate Unit Role Access (Admin Only):
                    </div>

                    <div className="py-1">
                      {rolesList.map((r) => (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchRole(r.role, r.bty);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-800 transition-colors ${
                            currentUser.role === r.role ? 'bg-rose-950/40 border-l-2 border-rose-500 text-white' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-100">{r.label}</span>
                            {r.bty && (
                              <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                                {r.bty}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5">{r.desc}</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          logout();
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-center px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1.5 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Logout Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Firebase Live Cloud Sync Indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono"
              title="Real-time Firestore Synchronized"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-bold">Cloud Live</span>
            </div>

            {/* Profile Pill with User Photo & Name Initials */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {currentUser.avatar || firebaseUser?.photoURL ? (
                <img
                  src={currentUser.avatar || firebaseUser?.photoURL || ''}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-rose-500/50 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-bold text-xs text-white shadow-inner font-mono">
                  {(() => {
                    const name = currentUser.name || '';
                    const parts = name.trim().split(/\s+/);
                    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
                    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                  })()}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white truncate max-w-[130px]">
                  {currentUser.rank} {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentUser.role} {currentUser.assignedBattery ? `[${currentUser.assignedBattery}]` : ''}
                </span>
              </div>
            </div>

            {/* Universal Logout Button for All Users */}
            <button
              onClick={logout}
              title="লগআউট (Logout Session)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-medium transition-all cursor-pointer ml-1 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-bold">লগআউট</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
