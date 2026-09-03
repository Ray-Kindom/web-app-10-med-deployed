import React from 'react';
import { useApp } from '../context/AppContext';
import { PersonnelTable } from '../components/personnel/PersonnelTable';
import { Personnel } from '../types';
import { UserPlus } from 'lucide-react';

interface MasterPersonnelPageProps {
  onViewDossier: (person: Personnel) => void;
  onOpenAddModal: () => void;
  onOpenPrintModal: () => void;
}

export const MasterPersonnelPage: React.FC<MasterPersonnelPageProps> = ({
  onViewDossier,
  onOpenAddModal,
}) => {
  const { personnelList, currentUser } = useApp();

  // Rank Category Counts with strict short terminology: Offr, JCO, NCO, Snk
  const officerCount = personnelList.filter((p) => ['Lt Col', 'Maj', 'Capt', 'Lt'].includes(p.rk)).length;
  const jcoCount = personnelList.filter((p) => ['SWO', 'WO'].includes(p.rk)).length;
  const ncoCount = personnelList.filter((p) => ['Sgt', 'Cpl', 'Lcpl'].includes(p.rk)).length;
  const soldierCount = personnelList.filter((p) => ['Snk', 'Gnr'].includes(p.rk)).length;

  // Trade Counts (Short forms)
  const taCount = personnelList.filter((p) => p.trade === 'TA').length;
  const ocuCount = personnelList.filter((p) => p.trade === 'OCU').length;
  const dmtCount = personnelList.filter((p) => p.trade === 'DMT').length;
  const gnrCount = personnelList.filter((p) => p.trade === 'Gnr').length;
  const ckCount = personnelList.filter((p) => p.trade === 'Ck(U)').length;

  return (
    <div className="space-y-6">
      {/* Header Banner without redundant buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Master Nominal Roll
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {personnelList.length} Active Records
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Master Personnel Database
          </h1>
          <p className="text-xs text-slate-400">
            10 Medium Regiment Artillery rank-wise nominal roll & trade specialties.
          </p>
        </div>

        {currentUser.role === 'RSM' && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enlist Soldier</span>
            </button>
          </div>
        )}
      </div>

      {/* Rank Hierarchy Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-rose-300">
            <span className="font-bold">Offr</span>
            <span className="text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded text-rose-400">Lt Col - Lt</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{officerCount}</div>
          <div className="text-[11px] text-slate-400 font-sans">Command & Fire Control</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-amber-300">
            <span className="font-bold">JCO</span>
            <span className="text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-400">SWO / WO</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{jcoCount}</div>
          <div className="text-[11px] text-slate-400 font-sans">RSM, BSM & Technical Chiefs</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-blue-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-blue-300">
            <span className="font-bold">NCO</span>
            <span className="text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-400">Sgt - Lcpl</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{ncoCount}</div>
          <div className="text-[11px] text-slate-400 font-sans">Gun Detachment Commanders</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
            <span className="font-bold">Snk</span>
            <span className="text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-400">Snk / Gnr</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{soldierCount}</div>
          <div className="text-[11px] text-slate-400 font-sans">Gun Numbers & Specialists</div>
        </div>
      </div>

      {/* Regimental Trade Specialties Summary Bar */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5">
            <span>Artillery Trades:</span>
          </span>
          <span className="text-slate-500 text-[11px]">Specialist Wings of 10 Med Regt</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono">
          <div className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
            <span className="font-bold">DMT:</span>
            <strong className="text-white font-bold">{dmtCount}</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5">
            <span className="font-bold">TA:</span>
            <strong className="text-white font-bold">{taCount}</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5">
            <span className="font-bold">OCU:</span>
            <strong className="text-white font-bold">{ocuCount}</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
            <span className="font-bold">Gnr:</span>
            <strong className="text-white font-bold">{gnrCount}</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-1.5">
            <span className="font-bold">Ck(U):</span>
            <strong className="text-white font-bold">{ckCount}</strong>
          </div>
        </div>
      </div>

      {/* Main Personnel Table Component */}
      <PersonnelTable
        personnel={personnelList}
        onViewDossier={onViewDossier}
        onOpenAddModal={onOpenAddModal}
        allowStatusEdits={currentUser.role !== 'CO'}
        title="Nominal"
      />
    </div>
  );
};
