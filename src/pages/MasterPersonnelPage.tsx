import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PersonnelTable } from '../components/personnel/PersonnelTable';
import { Personnel, Battery } from '../types';
import { UserPlus, Layers, Building2 } from 'lucide-react';

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

  // Battery serial: P Bty, Q Bty, R Bty, HQ Bty
  const batteryOrder: Battery[] = ['P Bty', 'Q Bty', 'R Bty', 'HQ Bty'];

  // Two primary modes: 'REGT' (Regt Nominal) or 'BTY' (Bty Nominal)
  const [viewMode, setViewMode] = useState<'REGT' | 'BTY'>('REGT');
  
  // If user is BSM, default active battery to their assigned battery; otherwise P Bty
  const initialBattery: Battery = currentUser.assignedBattery || 'P Bty';
  const [activeBatteryTab, setActiveBatteryTab] = useState<Battery>(initialBattery);

  // Filter list depending on selected mode
  const displayedPersonnel = viewMode === 'REGT'
    ? personnelList
    : personnelList.filter((p) => p.battery === activeBatteryTab);

  // Rank Category Counts with strict terminology
  const officerCount = displayedPersonnel.filter((p) => ['Lt Col', 'Maj', 'Capt', 'Lt'].includes(p.rk)).length;
  const jcoCount = displayedPersonnel.filter((p) => ['SWO', 'WO'].includes(p.rk)).length;
  const ncoCount = displayedPersonnel.filter((p) => ['Sgt', 'Cpl', 'Lcpl'].includes(p.rk)).length;
  const soldierCount = displayedPersonnel.filter((p) => ['Snk', 'Gnr'].includes(p.rk)).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {viewMode === 'REGT' ? 'Regt Nominal Roll' : `${activeBatteryTab} Nominal Roll`}
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {displayedPersonnel.length} Personnel
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {viewMode === 'REGT' ? 'Regt Nominal' : `${activeBatteryTab} Nominal`}
          </h1>
          <p className="text-xs text-slate-400">
            10 Medium Regiment Artillery nominal roll & trade specialties.
          </p>
        </div>

        {['RSM', 'Admin'].includes(currentUser.role) && (
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

      {/* Primary Toggle: "Regt Nominal" vs "Bty Nominal" */}
      <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('REGT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'REGT'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 border border-rose-500'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Regt Nominal ({personnelList.length})</span>
          </button>

          <button
            onClick={() => setViewMode('BTY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'BTY'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 border border-rose-500'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Bty Nominal</span>
          </button>
        </div>

        {/* Battery Sub-Tabs (P, Q, R, HQ) */}
        {viewMode === 'BTY' && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {batteryOrder.map((bty) => {
              const count = personnelList.filter((p) => p.battery === bty).length;
              const isSelected = activeBatteryTab === bty;
              return (
                <button
                  key={bty}
                  onClick={() => setActiveBatteryTab(bty)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{bty}</span>
                  <span className={`text-[10px] px-1.5 rounded ${isSelected ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
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
          <div className="text-[11px] text-slate-400 font-sans">Command & Control</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-amber-300">
            <span className="font-bold">JCO</span>
            <span className="text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-400">SWO / WO</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{jcoCount}</div>
          <div className="text-[11px] text-slate-400 font-sans">RSM & BSMs</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-blue-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-blue-300">
            <span className="font-bold">NCO</span>
            <span className="text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-400">Sgt - Lcpl</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{ncoCount}</div>
          <div className="text-[11px] text-slate-400 font-sans">Detachment Commanders</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
            <span className="font-bold">Snk</span>
            <span className="text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-400">Snk / Gnr</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{soldierCount}</div>
          <div className="text-[11px] text-slate-400 font-sans">Gunners & Specialists</div>
        </div>
      </div>

      {/* Main Personnel Table Component */}
      <PersonnelTable
        personnel={displayedPersonnel}
        fixedBattery={viewMode === 'BTY' ? activeBatteryTab : undefined}
        onViewDossier={onViewDossier}
        onOpenAddModal={onOpenAddModal}
        allowStatusEdits={currentUser.role !== 'CO'}
        title={viewMode === 'REGT' ? 'Regt Nominal' : `${activeBatteryTab} Nominal`}
      />
    </div>
  );
};
