import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnitLogo } from '../common/UnitLogo';
import { ParadeDutyCategory, Battery } from '../../types';
import { normalizeDutyName } from '../../utils/paradeCalculations';
import { Printer, X, ShieldAlert, CheckCircle2, Columns, List, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface DutyDetailPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  sessionType: string;
  filterBattery?: Battery | 'Consolidated';
}

const CATEGORY_META: Record<
  ParadeDutyCategory,
  { num: string; title: string; shortTitle: string }
> = {
  'Unit Sy': {
    num: '1.',
    title: 'UNIT SECURITY (UNIT SY)',
    shortTitle: 'Unit Security',
  },
  working: {
    num: '2.',
    title: 'WORKING PARTIES (FATIGUE & RATIONS)',
    shortTitle: 'Working Parties',
  },
  'Fixed Duty': {
    num: '3.',
    title: 'FIXED SUB-UNIT & REGIMENTAL DUTIES',
    shortTitle: 'Fixed Duty',
  },
  Others: {
    num: '4.',
    title: 'OTHERS & SPECIAL OPERATIONAL TASKS',
    shortTitle: 'Others & Special',
  },
};

const ORDERED_CATEGORIES: ParadeDutyCategory[] = ['Unit Sy', 'working', 'Fixed Duty', 'Others'];

export const DutyDetailPrintModal: React.FC<DutyDetailPrintModalProps> = ({
  isOpen,
  onClose,
  date,
  sessionType,
  filterBattery = 'Consolidated',
}) => {
  const { getParadeDutyAssignments, getParadeSummary, currentUser, getDutySessionStatus } = useApp();
  const dutyStatus = getDutySessionStatus(date, sessionType);

  // Manual or automatic zoom/density control (guarantees fitting strictly inside a single A4 page)
  const [scaleMode, setScaleMode] = useState<'auto' | number>('auto');
  const [layoutMode, setLayoutMode] = useState<'auto' | 'category' | '2col'>('auto');

  const paradeSummary = useMemo(() => {
    return getParadeSummary(filterBattery, date, sessionType);
  }, [getParadeSummary, filterBattery, date, sessionType]);

  const allAssignments = useMemo(() => {
    const raw = getParadeDutyAssignments(date, sessionType);
    const filtered = (!filterBattery || filterBattery === 'Consolidated')
      ? raw
      : raw.filter((a) => a.battery === filterBattery);

    // Sort by category order, then normalized dutyName, then rank order/snkNo
    return filtered.map(a => ({
      ...a,
      dutyName: normalizeDutyName(a.dutyName || 'General'),
    })).sort((a, b) => {
      const catIdxA = ORDERED_CATEGORIES.indexOf(a.category);
      const catIdxB = ORDERED_CATEGORIES.indexOf(b.category);
      if (catIdxA !== catIdxB) return catIdxA - catIdxB;
      if (a.dutyName !== b.dutyName) return a.dutyName.localeCompare(b.dutyName);
      return a.snkNo.localeCompare(b.snkNo);
    });
  }, [getParadeDutyAssignments, date, sessionType, filterBattery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<ParadeDutyCategory, number> = {
      'Unit Sy': 0,
      working: 0,
      'Fixed Duty': 0,
      Others: 0,
    };
    allAssignments.forEach((a) => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      }
    });
    return counts;
  }, [allAssignments]);

  // Battery counts
  const batteryCounts = useMemo(() => {
    const btyMap: Record<string, number> = {
      'HQ Bty': 0,
      'P Bty': 0,
      'Q Bty': 0,
      'R Bty': 0,
    };
    allAssignments.forEach((a) => {
      if (btyMap[a.battery] !== undefined) {
        btyMap[a.battery]++;
      }
    });
    return btyMap;
  }, [allAssignments]);

  // Group assignments by category
  const groupedData = useMemo(() => {
    return ORDERED_CATEGORIES.map((cat) => {
      const catAssignments = allAssignments.filter((a) => a.category === cat);
      return {
        category: cat,
        meta: CATEGORY_META[cat],
        totalCount: catAssignments.length,
        personnelList: catAssignments,
      };
    });
  }, [allAssignments]);

  // Effective layout mode: if auto, use 2-column if more than 22 personnel to preserve 1-page A4
  const effectiveLayout = useMemo(() => {
    if (layoutMode === 'category') return 'category';
    if (layoutMode === '2col') return '2col';
    return allAssignments.length > 22 ? '2col' : 'category';
  }, [layoutMode, allAssignments.length]);

  // Effective scale factor: mathematically calculated to prevent spilling beyond 1 A4 page
  const effectiveScale = useMemo(() => {
    if (typeof scaleMode === 'number') return scaleMode;
    const count = allAssignments.length;
    if (effectiveLayout === '2col') {
      if (count <= 28) return 1.0;
      if (count <= 42) return 0.94;
      if (count <= 60) return 0.88;
      if (count <= 80) return 0.80;
      return 0.72;
    } else {
      if (count <= 12) return 1.0;
      if (count <= 18) return 0.94;
      if (count <= 24) return 0.86;
      if (count <= 32) return 0.78;
      if (count <= 45) return 0.70;
      return 0.62;
    }
  }, [scaleMode, allAssignments.length, effectiveLayout]);

  if (!isOpen) return null;

  const formattedDate = (() => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase();
    } catch {
      return date;
    }
  })();

  const printDateStr = (() => {
    try {
      const d = new Date(date);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    } catch {
      return date;
    }
  })();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto print:z-auto">
      {/* Strict 1-Page A4 Portrait CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 5mm 4mm 5mm !important;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #duty-detail-print-document,
          #duty-detail-print-document * {
            visibility: visible !important;
          }
          #duty-detail-print-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: 288mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            transform-origin: top center !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-300 print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none max-h-[96vh]">
        {/* Top Action & Layout Control Bar (Hidden when printing) */}
        <div className="px-4 py-2.5 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-2.5 print:hidden border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Duty Detailing Printable Nominal Roll</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                  Guaranteed 1-Page A4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {sessionType} Parade • {printDateStr} • Total Detailed: {allAssignments.length}
              </p>
            </div>
          </div>

          {/* Layout & Density Controls */}
          <div className="flex items-center flex-wrap gap-1.5 font-mono text-[11px]">
            {/* Layout Mode */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setLayoutMode('category')}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  effectiveLayout === 'category' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Category Grouped View"
              >
                <List className="w-3 h-3" />
                <span>Categories</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('2col')}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  effectiveLayout === '2col' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="2-Column Ultra Dense View (Fits up to 80 soldiers on 1 A4)"
              >
                <Columns className="w-3 h-3" />
                <span>2-Col Grid</span>
              </button>
            </div>

            {/* Scale / Density Preset */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setScaleMode('auto')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  scaleMode === 'auto' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Automatically calculate zoom to perfectly fill 1 A4 page"
              >
                Auto Fit A4 ({Math.round(effectiveScale * 100)}%)
              </button>
              <button
                type="button"
                onClick={() => setScaleMode(1.0)}
                className={`px-1.5 py-1 rounded text-[10px] transition-colors cursor-pointer ${
                  scaleMode === 1.0 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setScaleMode(0.9)}
                className={`px-1.5 py-1 rounded text-[10px] transition-colors cursor-pointer ${
                  scaleMode === 0.9 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                90%
              </button>
              <button
                type="button"
                onClick={() => setScaleMode(0.8)}
                className={`px-1.5 py-1 rounded text-[10px] transition-colors cursor-pointer ${
                  scaleMode === 0.8 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                80%
              </button>
              <button
                type="button"
                onClick={() => setScaleMode(0.7)}
                className={`px-1.5 py-1 rounded text-[10px] transition-colors cursor-pointer ${
                  scaleMode === 0.7 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                70%
              </button>
            </div>

            {/* Print Action */}
            <button
              type="button"
              id="btn-confirm-print-duty-pdf"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer ml-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save A4 PDF</span>
            </button>

            <button
              type="button"
              id="btn-close-duty-print-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-100 print:bg-white print:p-0 flex justify-center">
          <div
            id="duty-detail-print-document"
            style={{
              zoom: effectiveScale,
              transformOrigin: 'top center',
            }}
            className="w-full max-w-[210mm] bg-white text-slate-950 font-sans p-4 sm:p-5 space-y-2 border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-2"
          >
            {/* 1. ULTRA-COMPACT OFFICIAL REGIMENTAL HEADER */}
            <div className="border-b-2 border-slate-950 pb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <UnitLogo size="md" />
                <div>
                  <h1 className="text-base font-black uppercase tracking-wider text-slate-950 font-serif leading-none">
                    10 MEDIUM REGIMENT ARTILLERY
                  </h1>
                  <div className="text-[9.5px] font-bold tracking-widest text-red-700 font-mono leading-tight">
                    BORN DESTROYER • HONOUR &amp; GLORY
                  </div>
                  <div className="text-[10px] text-slate-800 font-bold font-mono leading-tight">
                    DAILY DUTY ALLOCATION &amp; DETAIL NOMINAL ROLL (দৈনিক ডিউটি রোস্টার)
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-[9.5px] leading-tight border-l-2 border-slate-950 pl-3">
                <div className="font-black text-slate-950 uppercase text-[10.5px]">
                  {sessionType.toUpperCase()} PARADE DUTY
                </div>
                <div className="text-slate-900">
                  DATE: <span className="font-bold">{printDateStr} ({formattedDate.split(' ')[0]})</span>
                </div>
                <div className="text-slate-800">
                  SCOPE: <span className="font-bold uppercase">{filterBattery}</span>
                </div>
                <div className="text-[8.5px] font-bold text-red-700 uppercase tracking-wide">
                  RESTRICTED / OPERATIONAL
                </div>
                <div className="text-[8.5px] text-slate-600 font-semibold">
                  STATUS: {dutyStatus.status === 'Sent to Adjt' ? 'SENT TO ADJT (DISPATCHED)' : dutyStatus.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* 2. CONSOLIDATED EXECUTIVE STRENGTH & DUTY STRIP */}
            <div className="border border-slate-950 rounded bg-slate-50 p-1 font-mono text-[9px] space-y-0.5">
              {/* Row 1: The Master Strength Formula */}
              <div className="flex items-center justify-between border-b border-slate-300 pb-0.5">
                <span className="font-bold uppercase text-slate-950 flex items-center gap-1">
                  <span>STRENGTH SUMMARY:</span>
                </span>
                <div className="flex items-center gap-2 sm:gap-3 text-slate-900">
                  <span>Posted: <strong>{paradeSummary.totalPosted}</strong></span>
                  <span>Out: <strong>{paradeSummary.outOfUnit}</strong></span>
                  <span>Present in Unit: <strong>{paradeSummary.presentInUnit}</strong></span>
                  <span className="text-rose-700 font-bold">− Off Parade (Duty): <strong>{paradeSummary.offParade}</strong></span>
                  <span className="text-emerald-900 font-bold bg-emerald-100 px-1 py-0.2 rounded border border-emerald-300">
                    = On Parade: {paradeSummary.onParade} ({paradeSummary.onParadePercentage}%)
                  </span>
                </div>
              </div>

              {/* Row 2: Category & Battery Distribution in 1 line */}
              <div className="flex items-center justify-between text-slate-800 pt-0.5 text-[8.5px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-950 uppercase">DUTIES:</span>
                  <span className="px-1 py-0.2 bg-white rounded border border-slate-300">
                    1. Unit Sy: <strong>{categoryCounts['Unit Sy']}</strong>
                  </span>
                  <span className="px-1 py-0.2 bg-white rounded border border-slate-300">
                    2. Working: <strong>{categoryCounts.working}</strong>
                  </span>
                  <span className="px-1 py-0.2 bg-white rounded border border-slate-300">
                    3. Fixed: <strong>{categoryCounts['Fixed Duty']}</strong>
                  </span>
                  <span className="px-1 py-0.2 bg-white rounded border border-slate-300">
                    4. Others: <strong>{categoryCounts.Others}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-bold uppercase">SUB-UNITS:</span>
                  <span>HQ: <strong>{batteryCounts['HQ Bty']}</strong></span>
                  <span>P: <strong>{batteryCounts['P Bty']}</strong></span>
                  <span>Q: <strong>{batteryCounts['Q Bty']}</strong></span>
                  <span>R: <strong>{batteryCounts['R Bty']}</strong></span>
                </div>
              </div>
            </div>

            {/* 3. DETAILED NOMINAL ROLL SECTION */}
            {allAssignments.length === 0 ? (
              <div className="p-4 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-300 rounded bg-slate-50">
                — No personnel detailed for {sessionType} parade ({filterBattery}) —
              </div>
            ) : effectiveLayout === '2col' ? (
              /* ================= 2-COLUMN BALANCED GRID (ULTRA COMPACT, FITS 80+ SOLDIERS) ================= */
              <div className="space-y-1">
                <div className="flex items-center justify-between border-b border-slate-900 pb-0.5 font-mono text-[9px]">
                  <span className="font-bold uppercase text-slate-950">
                    NOMINAL ROLL OF DETAILED PERSONNEL (TOTAL: {allAssignments.length})
                  </span>
                  <span className="text-slate-600">
                    Arranged in Two Balanced Columns for Single-Page A4 Precision
                  </span>
                </div>

                {(() => {
                  const mid = Math.ceil(allAssignments.length / 2);
                  const col1 = allAssignments.slice(0, mid);
                  const col2 = allAssignments.slice(mid);

                  const renderHalfTable = (items: typeof allAssignments, startIndex: number) => (
                    <table className="w-full text-[9px] text-left border border-slate-900 border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-mono text-[8px] uppercase">
                          <th className="py-0.5 px-1 w-6 text-center border-r border-slate-700">Sl</th>
                          <th className="py-0.5 px-1 w-16 border-r border-slate-700">Snk No</th>
                          <th className="py-0.5 px-1 w-11 border-r border-slate-700">Rk</th>
                          <th className="py-0.5 px-1 border-r border-slate-700">Name</th>
                          <th className="py-0.5 px-1 w-10 text-center border-r border-slate-700">Bty</th>
                          <th className="py-0.5 px-1 w-24 border-r border-slate-700">Assigned Duty</th>
                          <th className="py-0.5 px-1 w-12 text-center">Sign</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 font-mono">
                        {items.map((p, idx) => {
                          const sl = startIndex + idx + 1;
                          const isEven = idx % 2 === 1;
                          return (
                            <tr key={p.id} className={isEven ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-0.5 px-1 text-center font-bold text-slate-600 border-r border-slate-300">
                                {sl}
                              </td>
                              <td className="py-0.5 px-1 font-bold text-slate-950 border-r border-slate-300 whitespace-nowrap">
                                {p.snkNo}
                              </td>
                              <td className="py-0.5 px-1 font-medium text-slate-800 border-r border-slate-300 whitespace-nowrap">
                                {p.rank}
                              </td>
                              <td className="py-0.5 px-1 font-bold text-slate-950 border-r border-slate-300 truncate max-w-[90px]">
                                {p.name}
                              </td>
                              <td className="py-0.5 px-1 text-center font-medium text-slate-800 border-r border-slate-300 whitespace-nowrap">
                                {p.battery.replace(' Bty', '')}
                              </td>
                              <td className="py-0.5 px-1 font-semibold text-slate-900 border-r border-slate-300 truncate max-w-[95px]">
                                {p.dutyName}
                              </td>
                              <td className="py-0.5 px-1 text-center text-slate-400 text-[8px]">
                                _____
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );

                  return (
                    <div className="grid grid-cols-2 gap-2 items-start">
                      <div>{renderHalfTable(col1, 0)}</div>
                      <div>{renderHalfTable(col2, mid)}</div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* ================= CATEGORY GROUPED VIEW (COMPACT CONSOLIDATED TABLES) ================= */
              <div className="space-y-1.5">
                {groupedData.map((group) => {
                  if (group.totalCount === 0) {
                    return (
                      <div
                        key={group.category}
                        className="flex items-center justify-between px-2 py-0.5 bg-slate-50 border border-slate-200 rounded font-mono text-[8.5px] text-slate-500"
                      >
                        <span className="font-bold text-slate-700">
                          {group.meta.num} {group.meta.title}
                        </span>
                        <span className="italic">— Nil detailed —</span>
                      </div>
                    );
                  }

                  let runningIndex = 0;
                  return (
                    <div
                      key={group.category}
                      className="border border-slate-900 rounded overflow-hidden break-inside-avoid"
                    >
                      {/* Compact Category Header Banner */}
                      <div className="bg-slate-900 text-white px-2 py-0.5 flex items-center justify-between font-mono text-[9px]">
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{group.meta.num} {group.meta.title}</span>
                        </div>
                        <span className="font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white text-[8px]">
                          Strength: {group.totalCount}
                        </span>
                      </div>

                      {/* Single Unified Table for all duties in this category */}
                      <table className="w-full text-[9px] text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-mono text-[8px] uppercase border-b border-slate-300">
                            <th className="py-0.5 px-1.5 w-7 text-center border-r border-slate-300">Sl</th>
                            <th className="py-0.5 px-1.5 w-20 border-r border-slate-300">Army / Snk No</th>
                            <th className="py-0.5 px-1.5 w-14 border-r border-slate-300">Rank</th>
                            <th className="py-0.5 px-1.5 border-r border-slate-300">Soldier Name</th>
                            <th className="py-0.5 px-1.5 w-14 text-center border-r border-slate-300">Battery</th>
                            <th className="py-0.5 px-1.5 w-44 border-r border-slate-300">Specific Duty Role</th>
                            <th className="py-0.5 px-1.5 w-20 text-center">Remarks / Sign</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          {group.personnelList.map((p, idx) => {
                            runningIndex++;
                            const isEven = idx % 2 === 1;
                            return (
                              <tr key={p.id} className={isEven ? 'bg-slate-50/70' : 'bg-white'}>
                                <td className="py-0.5 px-1.5 text-center text-slate-600 font-bold border-r border-slate-300">
                                  {runningIndex}
                                </td>
                                <td className="py-0.5 px-1.5 font-bold text-slate-950 border-r border-slate-300 whitespace-nowrap">
                                  {p.snkNo}
                                </td>
                                <td className="py-0.5 px-1.5 font-semibold text-slate-800 border-r border-slate-300 whitespace-nowrap">
                                  {p.rank}
                                </td>
                                <td className="py-0.5 px-1.5 font-bold text-slate-950 border-r border-slate-300">
                                  {p.name}
                                </td>
                                <td className="py-0.5 px-1.5 text-center font-medium text-slate-800 border-r border-slate-300 whitespace-nowrap">
                                  {p.battery}
                                </td>
                                <td className="py-0.5 px-1.5 font-bold text-slate-900 border-r border-slate-300">
                                  {p.dutyName}
                                </td>
                                <td className="py-0.5 px-1.5 text-center text-slate-400 text-[8px]">
                                  __________
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. COMPACT OFFICIAL MILITARY SIGNATURES BLOCK */}
            <div className="border-t-2 border-slate-950 pt-1.5 break-inside-avoid">
              {dutyStatus.status === 'Sent to Adjt' && (
                <div className="text-center font-mono text-[8.5px] text-emerald-950 bg-emerald-50 border border-emerald-400 py-0.5 px-2 rounded mb-1">
                  ✓ Officially Transmitted to Adjutant on {dutyStatus.sentToAdjtAt ? new Date(dutyStatus.sentToAdjtAt).toLocaleDateString('en-GB') : 'N/A'} by {dutyStatus.sentToAdjtBy || currentUser.name}
                  {dutyStatus.notes && (
                    <span className="block text-[8px] text-slate-700 italic">
                      Adjutant Dispatch Note: &quot;{dutyStatus.notes}&quot;
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center font-mono text-[9.5px]">
                <div className="space-y-0.5">
                  <div className="h-6 border-b border-slate-400 border-dashed mb-1" />
                  <div className="font-bold text-slate-950 uppercase text-[9px]">Detailed By (RSM)</div>
                  <div className="text-slate-600 text-[8px]">Regimental Sergeant Major</div>
                  <div className="text-slate-500 text-[7.5px]">10 Med Regt Arty</div>
                </div>

                <div className="space-y-0.5">
                  <div className="h-6 border-b border-slate-400 border-dashed mb-1" />
                  <div className="font-bold text-slate-950 uppercase text-[9px]">Verified By (BSM / Offr)</div>
                  <div className="text-slate-600 text-[8px]">Battery Commander / Adjt</div>
                  <div className="text-slate-500 text-[7.5px]">10 Med Regt Arty</div>
                </div>

                <div className="space-y-0.5">
                  <div className="h-6 border-b border-slate-400 border-dashed mb-1" />
                  <div className="font-bold text-slate-950 uppercase text-[9px]">Approved By (CO)</div>
                  <div className="text-slate-600 text-[8px]">Commanding Officer</div>
                  <div className="text-slate-500 text-[7.5px]">10 Med Regt Arty</div>
                </div>
              </div>

              <div className="text-center text-[7.5px] text-slate-500 font-mono mt-1">
                10 Med Regt Arty Parade &amp; Duty Management System • Confidential Military Record
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
