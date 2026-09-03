import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Edit3,
  Settings,
} from 'lucide-react';

export const TopModuleNavBar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    currentUser,
    setDailyParadeModalOpen,
  } = useApp();

  const role = currentUser.role;

  interface NavTab {
    id: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
    action?: () => void;
  }

  const isBsm = ['P BSM', 'Q BSM', 'R BSM', 'HQ BSM'].includes(role);
  const isCoOrOffr = role === 'CO' || role === 'Offr';
  const isRsm = role === 'RSM';

  const tabs: NavTab[] = [];

  if (isBsm) {
    tabs.push({
      id: 'battery_dashboard',
      label: 'Bty Dashboard',
      icon: Building2,
      badge: currentUser.assignedBattery || 'Bty',
    });
    tabs.push({
      id: 'parade_state',
      label: 'Parade State',
      icon: ClipboardList,
    });
    tabs.push({
      id: 'master_personnel',
      label: 'Regt Nominal',
      icon: Users,
    });
    tabs.push({
      id: 'data_update',
      label: 'Data Update',
      icon: Edit3,
      badge: 'Edit',
      action: () => setDailyParadeModalOpen(true),
    });
  } else if (isRsm) {
    tabs.push({
      id: 'main_dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
    });
    tabs.push({
      id: 'parade_state',
      label: 'Parade State',
      icon: ClipboardList,
    });
    tabs.push({
      id: 'master_personnel',
      label: 'Regt Nominal',
      icon: Users,
    });
    tabs.push({
      id: 'data_update',
      label: 'Data Update',
      icon: Edit3,
      badge: 'Edit',
      action: () => setDailyParadeModalOpen(true),
    });
  } else if (isCoOrOffr) {
    tabs.push({
      id: 'main_dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
    });
    tabs.push({
      id: 'parade_state',
      label: 'Parade State',
      icon: ClipboardList,
    });
    tabs.push({
      id: 'master_personnel',
      label: 'Regt Nominal',
      icon: Users,
    });
  } else {
    // Admin
    tabs.push({
      id: 'main_dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
    });
    tabs.push({
      id: 'battery_dashboard',
      label: 'Bty Dashboard',
      icon: Building2,
    });
    tabs.push({
      id: 'parade_state',
      label: 'Parade State',
      icon: ClipboardList,
    });
    tabs.push({
      id: 'master_personnel',
      label: 'Regt Nominal',
      icon: Users,
    });
    tabs.push({
      id: 'data_update',
      label: 'Data Update',
      icon: Edit3,
      badge: 'Edit',
      action: () => setDailyParadeModalOpen(true),
    });
    tabs.push({
      id: 'admin_panel',
      label: 'Admin Panel',
      icon: Settings,
      badge: 'Admin',
    });
  }

  return (
    <div className="sticky top-16 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2 mb-4">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar max-w-6xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => (tab.action ? tab.action() : setActivePage(tab.id))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 border border-rose-500'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
