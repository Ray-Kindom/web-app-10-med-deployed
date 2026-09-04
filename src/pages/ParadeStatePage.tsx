import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ParadeStateSummaryGrid } from '../components/parade/ParadeStateSummaryGrid';
import { ParadeActionControls } from '../components/parade/ParadeActionControls';
import { LeaveModal } from '../components/parade/LeaveModal';
import { CourseModal } from '../components/parade/CourseModal';
import { SickModal } from '../components/parade/SickModal';
import { DailyParadeStateModal } from '../components/parade/DailyParadeStateModal';
import { Personnel, Battery, isOfficerRank } from '../types';
import {
  Plus,
  PersonStanding,
  Dumbbell,
  Trophy,
  Trash2,
  Calendar,
  Clock,
  X,
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
    isAdmin,
    getRegimentalTotals,
    showNotification,
    addAuditLog,
    paradeBatteryStatus,
    setBatteryParadeStatus,
    selectedParadeDate,
    setSelectedParadeDate,
    paradeTypes,
    addParadeType,
    deleteParadeType,
    getParadeRecord,
    confirmBatteryParadeRecord,
    finalizeParadeType,
    dailyParadePoints,
  } = useApp();

  const [activeModalSession, setActiveModalSession] = useState<string | null>(null);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSickModalOpen, setIsSickModalOpen] = useState(false);
  const [isComdModalOpen, setIsComdModalOpen] = useState(false);

  const totals = getRegimentalTotals();
  const isOfficerOrCo =
    currentUser.role === 'CO' ||
    currentUser.role === 'Offr' ||
    (currentUser.role as string) === '2IC' ||
    (currentUser.role as string) === 'Officer' ||
    isOfficerRank(currentUser.rank);
  const isActualRsm = currentUser.role === 'RSM';
  const isBsm = !isOfficerOrCo && ['P BSM', 'Q BSM', 'R BSM', 'HQ BSM'].includes(currentUser.role);
  const isRsm = !isOfficerOrCo && (currentUser.role === 'RSM' || currentUser.role === 'Admin' || isAdmin);
  const assignedBty = (currentUser.assignedBattery as Battery) || 'P Bty';

  // Filter out soft-deleted/archived parade states for normal display across all dashboards
  const activeParadeTypes = useMemo(() => {
    return paradeTypes.filter((t) => !t.isDeleted && !t.deleted && t.isActive !== false);
  }, [paradeTypes]);

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

  const getParadeTypeIcon = (typeName: string) => {
    const lower = typeName.toLowerCase();
    // 2nd period: Strictly multiple soldiers falling in / standing in formation
    if (lower.includes('second') || lower.includes('period') || lower.includes('cadre') || lower.includes('trg')) {
      return (
        <div className="flex items-center -space-x-1.5 text-cyan-400" title="Soldiers Fall-in Formation">
          <PersonStanding className="w-4 h-4 text-cyan-400/80" />
          <PersonStanding className="w-5 h-5 text-cyan-300 scale-110" />
          <PersonStanding className="w-4 h-4 text-cyan-400/80" />
        </div>
      );
    }
    if (lower.includes('game') || lower.includes('sport')) {
      return (
        <div className="relative flex items-center justify-center" title="Games & Sports">
          <PersonStanding className="w-5 h-5 text-emerald-400" />
          <Trophy className="w-3 h-3 text-amber-300 absolute -bottom-0.5 -right-0.5 drop-shadow" />
        </div>
      );
    }
    // Default & Morning State: Soldier doing PT (PersonStanding + Dumbbell)
    return (
      <div className="relative flex items-center justify-center" title="Soldier doing PT">
        <PersonStanding className="w-5 h-5 text-rose-400" />
        <Dumbbell className="w-3 h-3 text-amber-300 absolute -bottom-0.5 -right-0.5 drop-shadow" />
      </div>
    );
  };

  const getParadeTypeStats = (typeName: string) => {
    let count = 0;
    let lastEditTime = 'Not Edited';

    const onParadePt = dailyParadePoints.find(
      (p) => p.name.trim().toUpperCase() === 'ON PARADE'
    );

    if (isBsm) {
      const rec = getParadeRecord(selectedParadeDate, typeName, assignedBty);
      const ptCount = onParadePt && rec.counts?.[onParadePt.id];
      if (ptCount && (ptCount.offr + ptCount.jco + ptCount.or > 0)) {
        count = ptCount.offr + ptCount.jco + ptCount.or;
      } else {
        count = personnelList.filter(
          (p) => p.battery === assignedBty && p.status === 'Present'
        ).length;
      }
      if (rec.lastUpdated && rec.lastUpdated !== 'Not submitted') {
        lastEditTime = rec.lastUpdated;
      }
    } else {
      let regtCount = 0;
      let hasRecordCounts = false;
      let latestEdit = '';

      (['P Bty', 'Q Bty', 'R Bty', 'HQ Bty'] as Battery[]).forEach((bty) => {
        const rec = getParadeRecord(selectedParadeDate, typeName, bty);
        const ptCount = onParadePt && rec.counts?.[onParadePt.id];
        if (ptCount && (ptCount.offr + ptCount.jco + ptCount.or > 0)) {
          regtCount += ptCount.offr + ptCount.jco + ptCount.or;
          hasRecordCounts = true;
        }
        if (rec.lastUpdated && rec.lastUpdated !== 'Not submitted') {
          if (!latestEdit || rec.lastUpdated > latestEdit) {
            latestEdit = rec.lastUpdated;
          }
        }
      });

      count = hasRecordCounts ? regtCount : totals.totalPresent;
      lastEditTime = latestEdit || 'Not Edited';
    }

    let formattedEditTime = lastEditTime;
    if (lastEditTime.includes(' ')) {
      formattedEditTime = lastEditTime;
    } else if (lastEditTime.includes('T')) {
      const d = new Date(lastEditTime);
      if (!isNaN(d.getTime())) {
        formattedEditTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
    }

    return { count, lastEditTime: formattedEditTime };
  };

  return (
    <div className="space-y-6">
      {/* PRIMARY PARADE STATE TYPE BOXES/CARDS (Morning, Second Period, Games + Dynamic) */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeParadeTypes.map((type) => {
            const btyRecord = getParadeRecord(selectedParadeDate, type.name, assignedBty);
            const badge = getStatusBadge(btyRecord.status);
            const stats = getParadeTypeStats(type.name);

            // Permission rules for deleting parade states:
            // Admin-created: Only Admin can delete (RSM, Officers, CO cannot delete)
            // RSM-created: RSM can delete, Admin can delete (Officers, CO cannot delete)
            const isCreatorAdmin = !type.createdBy || type.createdBy.toUpperCase().includes('ADMIN');
            const isCreatorRsm = type.createdBy?.toUpperCase().includes('RSM');
            const canDelete = !isOfficerOrCo && (isAdmin || (isActualRsm && isCreatorRsm && !isCreatorAdmin));

            return (
              <div
                key={type.id}
                onClick={() => setActiveModalSession(type.name)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-rose-500/60 p-4 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/30 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                      {getParadeTypeIcon(type.name)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-400 border border-slate-700/80" title={`Created by: ${type.createdBy || 'Admin'}`}>
                        {type.createdBy === 'RSM' ? 'RSM' : 'Admin'}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                        {badge.text}
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete "${type.name}" Parade State?`)) {
                              deleteParadeType(type.id);
                            }
                          }}
                          title={`Delete ${type.name} box`}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors font-sans">
                      {type.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Date: <strong className="text-slate-200">{selectedParadeDate}</strong></span>
                    </div>
                  </div>

                  {/* Highlighted On Parade metric box */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      On Parade:
                    </span>
                    <div className="text-right font-mono">
                      <span className="text-base font-bold text-emerald-300">
                        {stats.count}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">
                        {isBsm ? `(${assignedBty})` : `(Regt)`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-[10px] flex items-center gap-1 text-slate-400" title="Last Edit Time">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Last Edit: <strong className="text-slate-300">{stats.lastEditTime}</strong></span>
                  </span>
                  <span className="text-rose-400 font-bold group-hover:translate-x-0.5 transition-transform text-[11px] flex items-center gap-0.5">
                    Open Sheet →
                  </span>
                </div>
              </div>
            );
          })}

          {/* Sequential ADD NEW PARADE STATE box for RSM & Admin at the end of the grid */}
          {!isOfficerOrCo && (isActualRsm || isRsm || isAdmin) && (
            <div
              id="btn-add-new-parade-state-box"
              onClick={() => setIsAddTypeModalOpen(true)}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/50 via-slate-900/70 to-slate-950 border-2 border-dashed border-slate-700/80 hover:border-purple-500/80 p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/30 cursor-pointer flex flex-col items-center justify-center min-h-[220px] text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 transition-all flex items-center justify-center text-purple-400 mb-3 shadow-inner">
                <Plus className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold font-mono tracking-wider text-slate-200 group-hover:text-purple-300 transition-colors uppercase">
                ADD NEW PARADE STATE
              </span>
              <span className="text-[11px] text-slate-500 font-mono mt-1">
                Click to configure new session
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Updt Out Of Unit Action Control Box (Only accessible to RSM and BSM) */}
      {(isBsm || isRsm) && (
        <ParadeActionControls battery={isBsm ? assignedBty : undefined} />
      )}

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
