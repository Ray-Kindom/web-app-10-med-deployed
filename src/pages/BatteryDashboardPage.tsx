import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Battery, Personnel, ParadeStatus } from '../types';
import { StatCard } from '../components/common/StatCard';
import { PersonnelTable } from '../components/personnel/PersonnelTable';
import { ParadeActionControls } from '../components/parade/ParadeActionControls';
import {
  Building2,
  Users,
  CheckCircle2,
  ShieldAlert,
  HeartPulse,
  PlaneTakeoff,
  Send,
  Sparkles,
  Radio,
  Printer,
  X,
} from 'lucide-react';

interface BatteryDashboardPageProps {
  onViewDossier: (person: Personnel) => void;
  onOpenAddModal: () => void;
  onOpenPrintModal?: () => void;
}

export const BatteryDashboardPage: React.FC<BatteryDashboardPageProps> = ({
  onViewDossier,
  onOpenAddModal,
  onOpenPrintModal,
}) => {
  const {
    personnelList,
    currentUser,
    selectedBatteryFilter,
    setSelectedBatteryFilter,
    showNotification,
    addAuditLog,
  } = useApp();

  const [activeBattery, setActiveBattery] = useState<Battery>(
    currentUser.assignedBattery ||
      (selectedBatteryFilter !== 'All' ? selectedBatteryFilter : 'P Bty')
  );

  // Modal for showing drilldown list when stat box is clicked
  const [selectedStatFilter, setSelectedStatFilter] = useState<{
    title: string;
    status: ParadeStatus | 'All';
  } | null>(null);

  useEffect(() => {
    if (selectedBatteryFilter !== 'All') {
      setActiveBattery(selectedBatteryFilter);
    }
  }, [selectedBatteryFilter]);

  // Battery serial: P, Q, R, HQ
  const batteries: { id: Battery; name: string; role: string; commander: string; bsm: string }[] = [
    {
      id: 'P Bty',
      name: 'P Battery (P Bty - 1st Gun Bty)',
      role: 'Medium Artillery Field Fire Support',
      commander: 'Maj Kamrul Hassan',
      bsm: 'SWO Jafor',
    },
    {
      id: 'Q Bty',
      name: 'Q Battery (Q Bty - 2nd Gun Bty)',
      role: 'Medium Artillery Field Fire Support',
      commander: 'Maj Tanveer Ahmed',
      bsm: 'WO Hamid',
    },
    {
      id: 'R Bty',
      name: 'R Battery (R Bty - 3rd Gun Bty)',
      role: 'Medium Artillery Field Fire Support',
      commander: 'Capt M. S. Khan',
      bsm: 'WO Aminul',
    },
    {
      id: 'HQ Bty',
      name: 'HQ Battery (Headquarters)',
      role: 'Regimental Command, Signals & Logistics',
      commander: 'Capt Saifuddin Ahmed',
      bsm: 'SWO Nasir',
    },
  ];

  const currentBtyInfo = batteries.find((b) => b.id === activeBattery) || batteries[0];

  const btyPersonnel = personnelList.filter((p) => p.battery === activeBattery);
  const postedCount = btyPersonnel.length;
  const presentCount = btyPersonnel.filter((p) => p.status === 'Present').length;
  const dutyCount = btyPersonnel.filter((p) => p.status === 'On Duty').length;
  const sickCount = btyPersonnel.filter((p) => p.status === 'CMH/Sick').length;
  const leaveCount = btyPersonnel.filter((p) => p.status === 'Leave').length;
  const courseCount = btyPersonnel.filter((p) => p.status === 'Course/Trg' || p.status === 'Temp Duty').length;

  const effectivePresent = presentCount + dutyCount;
  const readinessPct = postedCount > 0 ? Math.round((effectivePresent / postedCount) * 100) : 0;

  const isBsm = ['P BSM', 'Q BSM', 'R BSM', 'HQ BSM'].includes(currentUser.role);
  const isBsmRestricted = isBsm && currentUser.assignedBattery && currentUser.assignedBattery !== activeBattery;

  const handleSubmitMorningRoll = () => {
    showNotification(`Morning Parade State for ${activeBattery} submitted to RSM & Duty Officer.`);
    addAuditLog(
      'Battery State Submitted',
      `Submitted ${activeBattery} state with ${presentCount} present out of ${postedCount}`,
      'PARADE_STATE'
    );
  };

  // Personnel for popup modal
  const modalPersonnel = selectedStatFilter
    ? selectedStatFilter.status === 'All'
      ? btyPersonnel
      : selectedStatFilter.status === 'Course/Trg'
      ? btyPersonnel.filter((p) => p.status === 'Course/Trg' || p.status === 'Temp Duty')
      : btyPersonnel.filter((p) => p.status === selectedStatFilter.status)
    : [];

  return (
    <div className="space-y-6">
      {/* Battery Selector Tabs - Only shown for Admin, CO, RSM. For BSM, shows their battery badge */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        {!isBsm ? (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            {batteries.map((b) => {
              const isSelected = activeBattery === b.id;
              const isAssigned = currentUser.assignedBattery === b.id;

              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBattery(b.id);
                    setSelectedBatteryFilter(b.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{b.id}</span>
                  {isAssigned && (
                    <span className="text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded text-white">
                      Assigned
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Building2 className="w-4 h-4 text-rose-500" />
            <span className="font-bold text-white">{activeBattery}</span>
            <span className="text-slate-400 text-[11px]">(আপনার দায়িত্বপ্রাপ্ত ব্যাটারি)</span>
          </div>
        )}

        {isBsm && !isBsmRestricted && (
          <button
            onClick={handleSubmitMorningRoll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit {activeBattery} Morning Roll</span>
          </button>
        )}
      </div>

      {/* Battery Header Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                10 Med Regt Sub-Unit
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                PARADE STATE VERIFIED
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-sans mt-1">
              {currentBtyInfo.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{currentBtyInfo.role}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-xs font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div>
                <div className="text-[10px] text-slate-400">Battery Commander (BC):</div>
                <div className="font-bold text-slate-200">{currentBtyInfo.commander}</div>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <div className="text-[10px] text-slate-400">Battery Sgt Major (BSM):</div>
                <div className="font-bold text-rose-400">{currentBtyInfo.bsm}</div>
              </div>
            </div>

            {onOpenPrintModal && (
              <button
                onClick={onOpenPrintModal}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap self-stretch sm:self-auto cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-rose-400" />
                <span>Print State</span>
              </button>
            )}
          </div>
        </div>

        {/* Readiness Meter */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Battery Combat & Manning State</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {readinessPct}% Effective ({effectivePresent}/{postedCount})
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${readinessPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Battery Clickable Stat Cards - cleaned up without hint text */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            title="Posted in Bty"
            value={postedCount}
            icon={Users}
            colorScheme="slate"
            onClick={() => setSelectedStatFilter({ title: `${activeBattery} Posted Strength`, status: 'All' })}
          />
          <StatCard
            title="Present On Parade"
            value={presentCount}
            icon={CheckCircle2}
            colorScheme="emerald"
            onClick={() => setSelectedStatFilter({ title: `${activeBattery} Present on Parade`, status: 'Present' })}
          />
          <StatCard
            title="On Guard / Duty"
            value={dutyCount}
            icon={ShieldAlert}
            colorScheme="blue"
            onClick={() => setSelectedStatFilter({ title: `${activeBattery} On Duty Troops`, status: 'On Duty' })}
          />
          <StatCard
            title="CMH / Sick"
            value={sickCount}
            icon={HeartPulse}
            colorScheme="amber"
            onClick={() => setSelectedStatFilter({ title: `${activeBattery} CMH / Sick Personnel`, status: 'CMH/Sick' })}
          />
          <StatCard
            title="On Leave"
            value={leaveCount}
            icon={PlaneTakeoff}
            colorScheme="purple"
            onClick={() => setSelectedStatFilter({ title: `${activeBattery} Troops on Leave`, status: 'Leave' })}
          />
          <StatCard
            title="Course / TD"
            value={courseCount}
            icon={Radio}
            colorScheme="cyan"
            onClick={() => setSelectedStatFilter({ title: `${activeBattery} Course / Temp Duty Personnel`, status: 'Course/Trg' })}
          />
        </div>
      </div>

      {/* Updt Daily Parade State & Updt Out Of Unit Action Control Boxes */}
      <ParadeActionControls battery={activeBattery} />



      {/* Clickable Stat Modal Popup */}
      {selectedStatFilter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[80vh] flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  {selectedStatFilter.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Total: {modalPersonnel.length} Personnel
                </p>
              </div>
              <button
                onClick={() => setSelectedStatFilter(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 pr-1">
              {modalPersonnel.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No personnel in this category.
                </div>
              ) : (
                modalPersonnel.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedStatFilter(null);
                      onViewDossier(p);
                    }}
                    className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-850 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-amber-300">
                        {p.rk}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {p.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span>{p.snkNo}</span>
                          <span>•</span>
                          <span>{p.trade}</span>
                          {p.statusDetails && (
                            <>
                              <span>•</span>
                              <span className="text-rose-400">{p.statusDetails}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStatFilter(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
