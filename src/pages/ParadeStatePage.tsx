import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ParadeStateSummaryGrid } from '../components/parade/ParadeStateSummaryGrid';
import { PersonnelTable } from '../components/personnel/PersonnelTable';
import { ParadeActionControls } from '../components/parade/ParadeActionControls';
import { LeaveModal } from '../components/parade/LeaveModal';
import { CourseModal } from '../components/parade/CourseModal';
import { SickModal } from '../components/parade/SickModal';
import { ComdModal } from '../components/parade/ComdModal';
import { Personnel, ParadeStatus } from '../types';
import {
  ClipboardList,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldCheck,
  Clock,
  Download,
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
  } = useApp();

  const [paradeType, setParadeType] = useState<'Morning' | 'Evening'>('Morning');
  const [approvalStage, setApprovalStage] = useState<'BSM_SUBMITTED' | 'RSM_VERIFIED' | 'ADJT_APPROVED'>('ADJT_APPROVED');

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSickModalOpen, setIsSickModalOpen] = useState(false);
  const [isComdModalOpen, setIsComdModalOpen] = useState(false);

  const totals = getRegimentalTotals();

  const handleApproveState = () => {
    setApprovalStage('ADJT_APPROVED');
    showNotification('10 Med Regt Morning Parade State formally approved by Adjutant.');
    addAuditLog(
      'Parade State Formally Approved',
      `State finalized by ${currentUser.rank} ${currentUser.name} (${currentUser.role})`,
      'PARADE_STATE'
    );
  };

  const offParadePersonnel = personnelList.filter((p) => p.status !== 'Present');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Parade State Command Module
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                LIVE MUSTER
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-sans mt-1">
              {paradeType} Parade State Muster
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Consolidated strength return for HQ, P, Q, and R Batteries.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Morning / Evening Toggle */}
            <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center text-xs font-mono">
              <button
                onClick={() => setParadeType('Morning')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  paradeType === 'Morning'
                    ? 'bg-rose-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                0630 Morning
              </button>
              <button
                onClick={() => setParadeType('Evening')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  paradeType === 'Evening'
                    ? 'bg-rose-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1800 Roll Call
              </button>
            </div>

            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official State</span>
            </button>
          </div>
        </div>

        {/* Parade State Approval Pipeline Steps */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 mb-2 uppercase">
            Muster Verification Pipeline:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-[11px]">1. BSM Submission</div>
                <div className="text-[9px] text-slate-400">All 4 Btys Submitted</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-[11px]">2. RSM Consolidation</div>
                <div className="text-[9px] text-slate-400">SWO Nasir Verified</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-[11px]">3. Adjutant Approval</div>
                <div className="text-[9px] text-slate-400">Capt Saifuddin Authorized</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
              <div>
                <div className="font-bold text-[11px]">4. CO Perusal</div>
                <div className="text-[9px] text-slate-400">Available on CO Brief</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category Action Cards for Lve, Course, CMH/Sick, COMD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-purple-500/30 hover:border-purple-500 flex items-center justify-between transition-all group text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <PlaneTakeoff className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white text-xs font-mono">Lve (Leave)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">P/Lve & C/Lve Nominal</p>
          </div>
          <span className="text-sm font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-1 rounded border border-purple-500/30">
            {totals.totalLeave}
          </span>
        </button>

        <button
          onClick={() => setIsCourseModalOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-500 flex items-center justify-between transition-all group text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-xs font-mono">Course</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Cadres & End Dates</p>
          </div>
          <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30">
            {totals.totalCourse}
          </span>
        </button>

        <button
          onClick={() => setIsSickModalOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500 flex items-center justify-between transition-all group text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-xs font-mono">CMH/Sick</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">CMH & Sic Reports</p>
          </div>
          <span className="text-sm font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-500/30">
            {totals.totalSick}
          </span>
        </button>

        <button
          onClick={() => setIsComdModalOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-indigo-500/30 hover:border-indigo-500 flex items-center justify-between transition-all group text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white text-xs font-mono">COMD</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Temp Duty & Attached</p>
          </div>
          <span className="text-sm font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-1 rounded border border-indigo-500/30">
            {totals.totalTempDuty + totals.totalAttached}
          </span>
        </button>
      </div>

      {/* Parade Action Control Boxes: Updt Daily Parade State & Updt Out Of Unit */}
      <ParadeActionControls />

      {/* Battery-Wise Matrix */}
      <ParadeStateSummaryGrid
        onOpenPrintModal={onOpenPrintModal}
        onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
        onOpenCourseModal={() => setIsCourseModalOpen(true)}
        onOpenSickModal={() => setIsSickModalOpen(true)}
        onOpenComdModal={() => setIsComdModalOpen(true)}
      />

      {/* Off-Parade Nominal Roll Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-rose-500" />
            <span>Off-Parade Personnel & Absentees Roll ({offParadePersonnel.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Categorized: CMH, Leave, Duty, Course, TD, AWOL
          </span>
        </div>

        <PersonnelTable
          personnel={personnelList}
          onViewDossier={onViewDossier}
          onOpenAddModal={onOpenAddModal}
          allowStatusEdits={currentUser.role !== 'CO'}
          title="Daily Parade Roll Call & Status Management"
        />
      </div>

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
