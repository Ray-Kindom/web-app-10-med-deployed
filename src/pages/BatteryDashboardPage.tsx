import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Battery, Personnel, ParadeStatus } from '../types';
import { StatCard } from '../components/common/StatCard';
import { PersonnelTable } from '../components/personnel/PersonnelTable';
import { ParadeActionControls } from '../components/parade/ParadeActionControls';
import {
  Users,
  CheckCircle2,
  ShieldAlert,
  HeartPulse,
  PlaneTakeoff,
  Send,
  Radio,
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

  const btyPersonnel = personnelList.filter((p) => p.battery === activeBattery);
  const postedCount = btyPersonnel.length;
  const presentCount = btyPersonnel.filter((p) => p.status === 'Present').length;
  const dutyCount = btyPersonnel.filter((p) => p.status === 'On Duty').length;
  const sickCount = btyPersonnel.filter((p) => p.status === 'CMH/Sick').length;
  const leaveCount = btyPersonnel.filter((p) => p.status === 'Leave').length;
  const courseCount = btyPersonnel.filter((p) => p.status === 'Course/Trg' || p.status === 'Temp Duty').length;

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
    <div className="space-y-5">
      {/* Battery Header: ONLY Battery Name (e.g. "P Bty" or user's respective battery name) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            {activeBattery}
          </h1>

          {/* Sub-unit battery selector for privileged users (Admin, CO, RSM, Offr) */}
          {!isBsm && (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
              {batteries.map((b) => {
                const isSelected = activeBattery === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBattery(b.id);
                      setSelectedBatteryFilter(b.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {b.id}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right action controls: BSM Morning Roll submission if eligible */}
        {isBsm && !isBsmRestricted && (
          <button
            onClick={handleSubmitMorningRoll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-colors whitespace-nowrap cursor-pointer self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit {activeBattery} Morning Roll</span>
          </button>
        )}
      </div>

      {/* Battery Stat Cards - adjusted with beautiful layout, clean spacing, and high contrast */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
