import React from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  ShieldCheck,
  Eye,
  Settings,
  LogIn,
  Layers,
  ChevronRight,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const { activePage, setActivePage, currentUser, personnelList, getRegimentalTotals } = useApp();
  const totals = getRegimentalTotals();

  const ALL_ROLES: Role[] = ['CO', 'Offr', 'RSM', 'P BSM', 'Q BSM', 'R BSM', 'HQ BSM', 'Admin'];

  const navigationItems = [
    {
      id: 'main_dashboard',
      label: 'Main Dashboard',
      description: 'Regimental Overview & Parade KPIs',
      icon: LayoutDashboard,
      badge: `${totals.presentPercentage}%`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'master_personnel',
      label: 'Master Personnel Database',
      description: 'All 10 Med Regt Nominal Roll',
      icon: Users,
      badge: `${personnelList.length}`,
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'battery_dashboard',
      label: 'Battery Dashboard',
      description: 'HQ, P, Q, R Battery Sub-units',
      icon: Building2,
      badge: currentUser.assignedBattery ? currentUser.assignedBattery : '4 Btys',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'parade_state',
      label: 'Parade State Dashboard',
      description: 'Morning & Evening Muster Roll',
      icon: ClipboardList,
      badge: 'Live',
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'rsm_dashboard',
      label: 'RSM Consolidated Dashboard',
      description: 'Regimental Police, Guards & Roster',
      icon: ShieldCheck,
      badge: 'RSM',
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      allowedRoles: ['CO', 'Offr', 'RSM', 'Admin'] as Role[],
    },
    {
      id: 'co_dashboard',
      label: 'CO Read-only Dashboard',
      description: 'Executive High-level Strategic State',
      icon: Eye,
      badge: 'CO View',
      badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'admin_panel',
      label: 'Admin Panel',
      description: 'Roles, Battery Assign & Audit Logs',
      icon: Settings,
      badge: 'Config',
      badgeColor: 'bg-slate-700 text-slate-300 border border-slate-600',
      allowedRoles: ['Admin', 'CO'] as Role[],
    },
    {
      id: 'login',
      label: 'Login / Role Switch Page',
      description: 'Auth & Profile Gateway',
      icon: LogIn,
      badge: currentUser.role,
      badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700',
      allowedRoles: ALL_ROLES,
    },
  ];

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-72 bg-slate-950/95 border-r border-slate-800/80 z-40 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
            <span>Command Navigation</span>
            <span className="text-slate-400">8 Modules</span>
          </div>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const isRestricted = !item.allowedRoles.includes(currentUser.role);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full group flex items-center justify-between p-3 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-rose-950/40 text-white border border-rose-500/40 shadow-md shadow-rose-950/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                } ${isRestricted ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                      isActive
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-900 text-slate-400 group-hover:text-rose-400 group-hover:bg-slate-850 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isActive ? 'text-rose-400 translate-x-0.5' : 'group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info & Regiment quick badge */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-925 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Unit Readiness</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {totals.presentPercentage}% FIT
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${totals.presentPercentage}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>POSTED: {totals.totalPosted}</span>
              <span>PRESENT: {totals.totalPresent}</span>
              <span>DUTY: {totals.totalDuty}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
