import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ParadeStateSummaryGrid } from '../components/parade/ParadeStateSummaryGrid';
import { ParadeActionControls } from '../components/parade/ParadeActionControls';
import { LeaveModal } from '../components/parade/LeaveModal';
import { CourseModal } from '../components/parade/CourseModal';
import { SickModal } from '../components/parade/SickModal';
import { DailyParadeStateModal } from '../components/parade/DailyParadeStateModal';
import { Personnel, Battery } from '../types';
import {
  X,
  Plus,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldCheck,
  Users,
  Layers,
  PlaneTakeoff,
  GraduationCap,
  HeartPulse,
  Compass,
} from 'lucide-react';

interface ParadeStatePageProps {
  onViewDossier: (person: Personnel) => void;
  onOpenAddModal: () => void;
  onOpenPrintModal: () => void;
}

export const ParadeStatePage: React.FC<ParadeStatePageProps> = ({
  onViewDossier,
  onOpenAddModal,
  onOpenPrintModal,
}) => {
  const {
    personnelList,
    currentUser,
    getRegimentalTotals,
    showNotification,
    addAuditLog,
    paradeBatteryStatus,
    setBatteryParadeStatus,
    selectedParadeDate,
    setSelectedParadeDate,
    paradeTypes,
    addParadeType,
    getParadeRecord,
    confirmBatteryParadeRecord,
    finalizeParadeType,
  } = useApp();

  const [activeModalSession, setActiveModalSession] = useState<string | null>(null);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSickModalOpen, setIsSickModalOpen] = useState(false);
  const [isComdModalOpen, setIsComdModalOpen] = useState(false);

  const totals = getRegimentalTotals();
  const isBsm = ['P BSM', 'Q BSM', 'R BSM', 'HQ BSM'].includes(currentUser.role);
  const isRsm = currentUser.role === 'RSM' || currentUser.role === 'Admin';
  const assignedBty = (currentUser.assignedBattery as Battery) || 'P Bty';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return { text: '✓ Confirmed', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'Finalized':
        return { text: '✓ Finalized', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'Edited by RSM':
        return { text: '✎ Edited by RSM', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'Submitted':
      case 'Pending RSM Confirmation':
        return { text: '⏳ Pending RSM', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default:
        return { text: 'Draft', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 PRIMARY PARADE STATE TYPE BOXES/CARDS (Morning, Second Period, Games, Roll Call + Dynamic) */}
      <div className="space-y-2">
        {isRsm && (
          <div className="flex justify-end px-1">
            <button
              onClick={() => setIsAddTypeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parade Type</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paradeTypes.map((type) => {
            const btyRecord = getParadeRecord(selectedParadeDate, type.name, assignedBty);
            const badge = getStatusBadge(btyRecord.status);

            return (
              <div
                key={type.id}
                onClick={() => setActiveModalSession(type.name)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-850 hover:border-rose-500/60 p-4 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/30 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors font-sans">
                      {type.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-[10px]">
                    {btyRecord.lastUpdated ? `Updt: ${btyRecord.lastUpdated.slice(-5)}` : 'No Entry'}
                  </span>
                  <span className="text-rose-400 font-bold group-hover:translate-x-0.5 transition-transform text-[11px]">
                    Open Sheet →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Updt Out Of Unit Action Control Box (PRESERVED EXACTLY AS EXISTING) */}
      <ParadeActionControls battery={isBsm ? assignedBty : undefined} />

      {/* Quick Category Action Cards for Lve, Course, CMH/Sick, COMD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-purple-500/30 hover:border-purple-500 flex items-center justify-between transition-all group text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <PlaneTakeoff className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white text-xs font-mono">Lve (Leave)</span>
          </div>
          <span className="text-sm font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-1 rounded border border-purple-500/30">
            {totals.totalLeave}
          </span>
        </button>

        <button
          onClick={() => setIsCourseModalOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-500 flex items-center justify-between transition-all group text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white text-xs font-mono">Course</span>
          </div>
          <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30">
            {totals.totalCourse}
          </span>
        </button>

        <button
          onClick={() => setIsSickModalOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500 flex items-center justify-between transition-all group text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white text-xs font-mono">CMH/Sick</span>
          </div>
          <span className="text-sm font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-500/30">
            {totals.totalSick}
          </span>
        </button>

        <button
          onClick={() => setIsComdModalOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-indigo-500/30 hover:border-indigo-500 flex items-center justify-between transition-all group text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white text-xs font-mono">COMD</span>
          </div>
          <span className="text-sm font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-1 rounded border border-indigo-500/30">
            {totals.totalTempDuty + totals.totalAttached}
          </span>
        </button>
      </div>

      {/* Battery-Wise Matrix */}
      <ParadeStateSummaryGrid
        onOpenPrintModal={onOpenPrintModal}
        onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
        onOpenCourseModal={() => setIsCourseModalOpen(true)}
        onOpenSickModal={() => setIsSickModalOpen(true)}
        onOpenComdModal={() => setIsComdModalOpen(true)}
      />

      {/* Category Modals */}
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
      {/* Active Session DailyParadeStateModal (Morning, Second Period, Games, Roll Call etc.) */}
      {activeModalSession && (
        <DailyParadeStateModal
          isOpen={Boolean(activeModalSession)}
          onClose={() => setActiveModalSession(null)}
          sessionType={activeModalSession}
          date={selectedParadeDate}
          defaultBattery={isBsm ? assignedBty : undefined}
          onOpenPrintModal={onOpenPrintModal}
        />
      )}

      {/* RSM Modal: Add New Parade State Type */}
      {isAddTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create New Parade State Type</h3>
              <button
                onClick={() => setIsAddTypeModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-mono font-bold">
                Parade State Name (e.g. Evening Muster, Special Inspection)
              </label>
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Enter Parade Type Name..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAddTypeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newTypeName.trim()) {
                    addParadeType(newTypeName.trim());
                    setNewTypeName('');
                    setIsAddTypeModalOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save & Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
