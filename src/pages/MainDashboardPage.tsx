import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { ParadeStateSummaryGrid } from '../components/parade/ParadeStateSummaryGrid';
import { PersonnelTable } from '../components/personnel/PersonnelTable';
import { LeaveModal } from '../components/parade/LeaveModal';
import { CourseModal } from '../components/parade/CourseModal';
import { SickModal } from '../components/parade/SickModal';
import { ComdModal } from '../components/parade/ComdModal';
import { Battery, Personnel } from '../types';
import {
  Users,
  CheckCircle2,
  ShieldAlert,
  HeartPulse,
  PlaneTakeoff,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Printer,
  Plus,
  Clock,
  Shield,
  Building2,
  Layers,
  ChevronRight,
  UserCheck,
  Compass,
} from 'lucide-react';

interface MainDashboardPageProps {
  onViewDossier: (person: Personnel) => void;
  onOpenAddModal: () => void;
  onOpenPrintModal: () => void;
}

export const MainDashboardPage: React.FC<MainDashboardPageProps> = ({
  onViewDossier,
  onOpenAddModal,
  onOpenPrintModal,
}) => {
  const {
    currentUser,
    personnelList,
    getRegimentalTotals,
    setActivePage,
    setSelectedBatteryFilter,
    auditLogs,
  } = useApp();

  const [selectedBattery, setSelectedBattery] = useState<Battery | 'All'>('All');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSickModalOpen, setIsSickModalOpen] = useState(false);
  const [isComdModalOpen, setIsComdModalOpen] = useState(false);

  const troopsSectionRef = useRef<HTMLDivElement>(null);

  const totals = getRegimentalTotals();

  const batteryList: { bty: Battery; name: string; shortCode: string; role: string }[] = [
    { bty: 'HQ Bty', name: 'HQ Battery (Headquarters)', shortCode: 'HQ', role: 'Command & Signals' },
    { bty: 'P Bty', name: 'P Battery (P Bty)', shortCode: 'P', role: '1st Gun Support' },
    { bty: 'Q Bty', name: 'Q Battery (Q Bty)', shortCode: 'Q', role: '2nd Gun Support' },
    { bty: 'R Bty', name: 'R Battery (R Bty)', shortCode: 'R', role: '3rd Gun Support' },
  ];

  const handleSelectBatteryBox = (bty: Battery) => {
    setSelectedBattery(bty);
    setSelectedBatteryFilter(bty);
    // Smoothly scroll down to the troops nominal table if needed
    if (troopsSectionRef.current) {
      troopsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const btyTroopsCount = (bty: Battery) => {
    return personnelList.filter((p) => p.battery === bty).length;
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-rose-600/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                10 Medium Regiment Artillery
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                MORNING PARADE ACTIVE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-tight">
              Regimental Command Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              <span className="text-white font-semibold">{currentUser.rank} {currentUser.name}</span> ({currentUser.role})
            </p>
          </div>

          <div className="flex items-center gap-2 sm:self-end">
            {currentUser.role === 'RSM' && (
              <button
                id="enlist-soldier-btn-rsm"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enlist Soldier</span>
              </button>
            )}
            <button
              id="print-parade-state-btn"
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-rose-400" />
              <span>Print Parade State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regimental Key Performance Stat Cards - 7 Key Status Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <StatCard
          title="Posted Strength"
          value={totals.totalPosted}
          subtitle="All 10 Med Roll"
          icon={Users}
          colorScheme="slate"
          badge="100% Accounted"
          onClick={() => {
            setSelectedBattery('All');
            if (troopsSectionRef.current) {
              troopsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
        <StatCard
          title="On Parade"
          value={totals.totalPresent}
          subtitle="In Unit Lines"
          icon={CheckCircle2}
          colorScheme="emerald"
          percentage={Math.round((totals.totalPresent / totals.totalPosted) * 100)}
          onClick={() => setActivePage('parade_state')}
        />
        <StatCard
          title="On Guard / Duty"
          value={totals.totalDuty}
          subtitle="Quarter Guard, RP"
          icon={ShieldAlert}
          colorScheme="blue"
          badge="3 Shifts Active"
          onClick={() => setActivePage('rsm_dashboard')}
        />
        <StatCard
          title="CMH/Sick"
          value={totals.totalSick}
          subtitle="CMH & Sic"
          icon={HeartPulse}
          colorScheme="amber"
          badge={totals.totalSick > 0 ? `${totals.totalSick} Admitted` : 'Nil Sick'}
          onClick={() => setIsSickModalOpen(true)}
        />
        <StatCard
          title="Lve"
          value={totals.totalLeave}
          subtitle="P/Lve & C/Lve"
          icon={PlaneTakeoff}
          colorScheme="purple"
          badge={totals.totalLeave > 0 ? `${totals.totalLeave} Soldiers` : 'Nil Leave'}
          onClick={() => setIsLeaveModalOpen(true)}
        />
        <StatCard
          title="Course"
          value={totals.totalCourse}
          subtitle="Cadres & Trg"
          icon={GraduationCap}
          colorScheme="cyan"
          badge={totals.totalCourse > 0 ? `${totals.totalCourse} Attending` : 'Nil Course'}
          onClick={() => setIsCourseModalOpen(true)}
        />
        <StatCard
          title="COMD"
          value={totals.totalTempDuty + totals.totalAttached}
          subtitle="TD & Attached"
          icon={Compass}
          colorScheme="indigo"
          badge={totals.totalTempDuty + totals.totalAttached > 0 ? `${totals.totalTempDuty + totals.totalAttached} Out` : 'Nil COMD'}
          onClick={() => setIsComdModalOpen(true)}
        />
      </div>

      {/* Main Grid: Battery Breakdown Table + Quick Actions & Recent Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bty Wise Parade State Matrix & Interactive Battery Boxes */}
        <div className="lg:col-span-2 space-y-6">
          <ParadeStateSummaryGrid
            selectedBattery={selectedBattery}
            onSelectBattery={(bty) => handleSelectBatteryBox(bty)}
            onOpenPrintModal={onOpenPrintModal}
            onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
            onOpenCourseModal={() => setIsCourseModalOpen(true)}
            onOpenSickModal={() => setIsSickModalOpen(true)}
            onOpenComdModal={() => setIsComdModalOpen(true)}
          />

          {/* Sub-Unit Quick Navigation Cards (Clicking any box automatically displays that battery's nominal roll) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Select Battery to View Nominal Roll</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Click box to show troops below
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {batteryList.map((item) => {
                const isSelected = selectedBattery === item.bty;
                const count = btyTroopsCount(item.bty);

                return (
                  <button
                    key={item.bty}
                    onClick={() => handleSelectBatteryBox(item.bty)}
                    className={`p-3.5 rounded-xl text-left transition-all group flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/80 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/30'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm border transition-colors ${
                            isSelected
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-slate-800 border-slate-700 text-rose-400 group-hover:border-rose-500'
                          }`}
                        >
                          {item.shortCode}
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {count} Soldiers
                        </span>
                      </div>

                      <div className="font-bold text-xs text-white mt-2.5 font-sans flex items-center gap-1">
                        <span>{item.bty}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{item.name}</div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
                      <span className={isSelected ? 'text-rose-300 font-bold' : 'text-slate-400'}>
                        {isSelected ? 'Active Roll' : 'View Nominal'}
                      </span>
                      <ArrowRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected
                            ? 'text-rose-400 translate-x-1'
                            : 'text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Action Shortcuts & Live Audit Log */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Quick Navigation Actions</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setActivePage('master_personnel')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">Search Master Nominal Roll</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActivePage('parade_state')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium">Update Daily Parade Status</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActivePage('rsm_dashboard')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">RSM Guard & Duty Roster</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActivePage('co_dashboard')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">CO Executive Readiness Brief</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Recent Parade Activity Logs (Admin Only) */}
          {currentUser.role === 'Admin' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Unit Activity & Audit Log</span>
                </h3>
                <button
                  onClick={() => setActivePage('admin_panel')}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
                {auditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{log.action}</span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {log.timestamp.slice(11, 16)} HRS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{log.details}</p>
                    <div className="text-[9px] text-rose-400 font-mono">By: {log.performedBy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Troop Nominal Roll Display (Shows Selected Battery Troops automatically) */}
      <div ref={troopsSectionRef} className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {selectedBattery === 'All' ? 'Full Regimental Roll' : `${selectedBattery} Sub-Unit Nominal`}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {selectedBattery === 'All'
                  ? `${personnelList.length} Personnel Total`
                  : `${btyTroopsCount(selectedBattery)} Troops in ${selectedBattery}`}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-sans">
              {selectedBattery === 'All'
                ? 'All 10 Med Regt Troops Nominal Roll'
                : `${selectedBattery} Personnel Nominal Roll & Active Parade State`}
            </h2>
          </div>

          {/* Quick Battery Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => {
                setSelectedBattery('All');
                setSelectedBatteryFilter('All');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                selectedBattery === 'All'
                  ? 'bg-rose-600 text-white font-bold shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All (140)
            </button>
            {batteryList.map((item) => {
              const isSelected = selectedBattery === item.bty;
              return (
                <button
                  key={item.bty}
                  onClick={() => handleSelectBatteryBox(item.bty)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-rose-600 text-white font-bold shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {item.bty} ({btyTroopsCount(item.bty)})
                </button>
              );
            })}

            {selectedBattery !== 'All' && (
              <button
                onClick={() => {
                  setSelectedBatteryFilter(selectedBattery);
                  setActivePage('battery_dashboard');
                }}
                className="ml-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold border border-slate-700 flex items-center gap-1 whitespace-nowrap"
              >
                <span>Full Bty Console</span>
                <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}
          </div>
        </div>

        {/* Live Filtered Table */}
        <PersonnelTable
          personnel={personnelList}
          fixedBattery={selectedBattery === 'All' ? undefined : selectedBattery}
          onViewDossier={onViewDossier}
          onOpenAddModal={onOpenAddModal}
          allowStatusEdits={currentUser.role !== 'CO'}
          title={
            selectedBattery === 'All'
              ? '10 Med Regt Master Personnel Roll'
              : `${selectedBattery} Troops Nominal Roll`
          }
        />
      </div>

      {/* Popups for Lve, Course, CMH/Sick, COMD */}
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSelectPersonnel={(p) => {
          setIsLeaveModalOpen(false);
          onViewDossier(p);
        }}
      />
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSelectPersonnel={(p) => {
          setIsCourseModalOpen(false);
          onViewDossier(p);
        }}
      />
      <SickModal
        isOpen={isSickModalOpen}
        onClose={() => setIsSickModalOpen(false)}
        onSelectPersonnel={(p) => {
          setIsSickModalOpen(false);
          onViewDossier(p);
        }}
      />
      <ComdModal
        isOpen={isComdModalOpen}
        onClose={() => setIsComdModalOpen(false)}
        onSelectPersonnel={(p) => {
          setIsComdModalOpen(false);
          onViewDossier(p);
        }}
      />
    </div>
  );
};

