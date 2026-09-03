import React from 'react';
import { useApp } from '../../context/AppContext';
import { Battery } from '../../types';
import {
  Layers,
  ArrowRightLeft,
  ChevronRight,
  Calculator,
  Plane,
  Shield,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';

interface ParadeActionControlsProps {
  battery?: Battery;
}

export const ParadeActionControls: React.FC<ParadeActionControlsProps> = ({ battery }) => {
  const {
    setDailyParadeModalOpen,
    setOutOfUnitModalOpen,
    dailyParadePoints,
    personnelList,
    setActiveOutOfUnitCategory,
  } = useApp();

  const outOfUnitCount = personnelList.filter((p) => {
    if (battery && p.battery !== battery) return false;
    return (
      Boolean(p.outOfUnitCategory) ||
      p.status === 'CMH/Sick' ||
      p.status === 'Course/Trg' ||
      p.status === 'Attached Out' ||
      p.status === 'Temp Duty' ||
      p.leaveType === 'P/Lve' ||
      p.leaveType === 'C/Lve'
    );
  }).length;

  const totalPoints = dailyParadePoints.filter((pt) => {
    if (!pt.isActive) return false;
    if (!battery) return true;
    return !pt.enabledBatteries || pt.enabledBatteries.includes(battery);
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Action Box 1: Updt Daily Parade State */}
      <div
        onClick={() => setDailyParadeModalOpen(true)}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 hover:border-rose-500/60 p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/30 cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/10 border border-rose-500/30 text-rose-400 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                  Updt Daily Parade State
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {totalPoints} Points
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                দৈনিক প্যারেড স্টেট ব্যবস্থাপনা (Offr, JCO & OR List Table)
              </p>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-800/80 group-hover:bg-rose-600 text-slate-400 group-hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Calculator className="w-3.5 h-3.5 text-rose-400" />
            <span>Auto-Calculated Summary (GPT, Kote, RP, MT & 29 Points)</span>
          </div>

          <span className="text-[11px] font-bold text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            <span>Open Parade Table</span>
            <span>→</span>
          </span>
        </div>
      </div>

      {/* Action Box 2: Updt Out Of Unit */}
      <div
        onClick={() => setOutOfUnitModalOpen(true)}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 hover:border-cyan-500/60 p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/30 cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Updt Out Of Unit
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {outOfUnitCount} Active Out
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                আউট অফ ইউনিট ব্যবস্থাপনা (ERE, Msn, Att, FDMN, CMH, Course, Comd, Leaves)
              </p>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-800/80 group-hover:bg-cyan-600 text-slate-400 group-hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Plane className="w-3.5 h-3.5 text-cyan-400" />
            <span>Direct 1-Click Navigation across all Out-of-Unit categories</span>
          </div>

          <span className="text-[11px] font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            <span>Manage Categories</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </div>
  );
};
