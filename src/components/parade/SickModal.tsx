import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Personnel } from '../../types';
import { RankBadge } from '../common/RankBadge';
import {
  X,
  HeartPulse,
  Calendar,
  Clock,
  MapPin,
  Search,
  Building,
  Activity,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';

interface SickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersonnel?: (person: Personnel) => void;
}

export const SickModal: React.FC<SickModalProps> = ({
  isOpen,
  onClose,
  onSelectPersonnel,
}) => {
  const { personnelList } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'CMH' | 'Sic'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBty, setSelectedBty] = useState<string>('ALL');

  // Filter all personnel with status 'CMH/Sick'
  const sickPersonnel = useMemo(() => {
    return personnelList.filter((p) => p.status === 'CMH/Sick');
  }, [personnelList]);

  // Counts
  const cmhCount = useMemo(() => {
    return sickPersonnel.filter(
      (p) => p.sickType === 'CMH' || p.statusDetails?.toLowerCase().includes('cmh') || p.hospitalName?.toLowerCase().includes('cmh')
    ).length;
  }, [sickPersonnel]);

  const sicCount = useMemo(() => {
    return sickPersonnel.filter(
      (p) => p.sickType === 'Sic' || p.statusDetails?.toLowerCase().includes('mi room') || p.statusDetails?.toLowerCase().includes('sic') || p.hospitalName?.toLowerCase().includes('mi room')
    ).length;
  }, [sickPersonnel]);

  // Filtered list
  const filteredList = useMemo(() => {
    return sickPersonnel.filter((p) => {
      // CMH vs Sic Filter
      const isCmh = p.sickType === 'CMH' || p.statusDetails?.toLowerCase().includes('cmh') || p.hospitalName?.toLowerCase().includes('cmh');
      const isSic = p.sickType === 'Sic' || p.statusDetails?.toLowerCase().includes('mi room') || p.statusDetails?.toLowerCase().includes('sic') || p.hospitalName?.toLowerCase().includes('mi room');

      if (filterType === 'CMH' && !isCmh) return false;
      if (filterType === 'Sic' && !isSic) return false;

      // Battery filter
      if (selectedBty !== 'ALL' && p.battery !== selectedBty) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSnk = p.snkNo.toLowerCase().includes(query);
        const matchRank = p.rk.toLowerCase().includes(query);
        const matchTrade = p.trade.toLowerCase().includes(query);
        const matchDiag = p.diagnosis?.toLowerCase().includes(query) || p.statusDetails?.toLowerCase().includes(query);
        const matchHosp = p.hospitalName?.toLowerCase().includes(query);
        if (!matchName && !matchSnk && !matchRank && !matchTrade && !matchDiag && !matchHosp) {
          return false;
        }
      }

      return true;
    });
  }, [sickPersonnel, filterType, selectedBty, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-sans tracking-tight">
                  CMH / Sick - Hospital & Medical State
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {sickPersonnel.length} Under Medical Care
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Top 2 Buttons: CMH & Sic */}
            <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === 'ALL'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Sick ({sickPersonnel.length})
              </button>
              <button
                onClick={() => setFilterType('CMH')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === 'CMH'
                    ? 'bg-amber-600 text-white shadow ring-2 ring-amber-400/40'
                    : 'bg-slate-850 hover:bg-slate-800 text-amber-300 border border-amber-500/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>CMH</span>
                <span className="ml-1 text-[10px] bg-amber-950 px-1.5 py-0.2 rounded text-amber-200">
                  {cmhCount}
                </span>
              </button>
              <button
                onClick={() => setFilterType('Sic')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === 'Sic'
                    ? 'bg-amber-600 text-white shadow ring-2 ring-amber-400/40'
                    : 'bg-slate-850 hover:bg-slate-800 text-amber-300 border border-amber-500/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span>Sic (MI Room)</span>
                <span className="ml-1 text-[10px] bg-yellow-950 px-1.5 py-0.2 rounded text-yellow-200">
                  {sicCount}
                </span>
              </button>
            </div>

            {/* Battery Filter */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Bty:
              </span>
              {['ALL', 'HQ Bty', 'P Bty', 'Q Bty', 'R Bty'].map((bty) => (
                <button
                  key={bty}
                  onClick={() => setSelectedBty(bty)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedBty === bty
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  {bty === 'ALL' ? 'All' : bty.replace(' Bty', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Army No, Rank, Name, Diagnosis, or Medical Facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
        </div>

        {/* Content Table / Nominal Roll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
              <HeartPulse className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No personnel currently admitted or sick</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-slate-800">
                    <th className="p-2.5">Ser</th>
                    <th className="p-2.5">Army No & Rank</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Battery</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 bg-amber-950/40 text-amber-300">Medical Facility / Hospital</th>
                    <th className="p-2.5">Diagnosis / Ailment</th>
                    <th className="p-2.5">Admission Date</th>
                    <th className="p-2.5 text-emerald-400 font-bold">Review / Re-Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredList.map((person, idx) => {
                    const isCmh = person.sickType === 'CMH' || person.statusDetails?.toLowerCase().includes('cmh');
                    const catBadge = isCmh ? 'CMH' : 'Sic';
                    const hospital = person.hospitalName || (isCmh ? 'CMH Savar' : 'Unit Regimental MI Room');
                    const diag = person.diagnosis || person.statusDetails || 'Under Medical Observation';
                    const admDate = person.admissionDate || '31 Aug 2026';
                    const review = person.reviewDate || '04 Sep 2026';

                    return (
                      <tr
                        key={person.id}
                        onClick={() => onSelectPersonnel && onSelectPersonnel(person)}
                        className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                      >
                        <td className="p-2.5 font-mono text-slate-500 text-center">{idx + 1}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px] border border-slate-700">
                              {person.snkNo}
                            </span>
                            <RankBadge rank={person.rk} size="sm" />
                          </div>
                        </td>
                        <td className="p-2.5 font-bold text-slate-100 whitespace-nowrap group-hover:text-amber-300 transition-colors">
                          {person.name}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700">
                            {person.battery}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                              isCmh
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {catBadge}
                          </span>
                        </td>
                        <td className="p-2.5 bg-amber-950/20 text-slate-200 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-sans font-semibold">
                            <Stethoscope className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{hospital}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-amber-200/90 font-mono text-xs">
                          {diag}
                        </td>
                        <td className="p-2.5 text-slate-400 text-xs font-mono whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{admDate}</span>
                          </div>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
                            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{review}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>Total Sick: <strong className="text-white">{filteredList.length}</strong></span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-rose-400">Hospitalized (CMH): {cmhCount}</span>
            <span className="hidden sm:inline text-amber-400">MI Room (Sic): {sicCount}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
