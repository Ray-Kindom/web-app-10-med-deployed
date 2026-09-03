import React from 'react';
import { useApp } from '../../context/AppContext';
import { Battery } from '../../types';
import {
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';

interface ParadeActionControlsProps {
  battery?: Battery;
}

export const ParadeActionControls: React.FC<ParadeActionControlsProps> = ({ battery }) => {
  const {
    setOutOfUnitModalOpen,
    personnelList,
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

  return (
    <div className="mb-6">
      {/* Updt Out Of Unit Action Box */}
      <div
        onClick={() => setOutOfUnitModalOpen(true)}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 hover:border-cyan-500/60 p-4 sm:p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/30 cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-sans">
                  Updt Out Of Unit
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {outOfUnitCount} Active Out
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Manage Leave, CMH/Hospital, Courses, Attachment & Temp Duty records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
            <span>Manage Records</span>
            <div className="p-1.5 rounded-lg bg-slate-800/80 group-hover:bg-cyan-600 text-slate-400 group-hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
