import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Personnel } from '../../types';
import { RankBadge } from '../common/RankBadge';
import {
  X,
  PlaneTakeoff,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Building,
  UserCheck,
} from 'lucide-react';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersonnel?: (person: Personnel) => void;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  onSelectPersonnel,
}) => {
  const { personnelList } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'P/Lve' | 'C/Lve'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBty, setSelectedBty] = useState<string>('ALL');

  // Filter all personnel with status 'Leave'
  const leavePersonnel = useMemo(() => {
    return personnelList.filter((p) => p.status === 'Leave');
  }, [personnelList]);

  // Counts
  const pLeaveCount = useMemo(() => {
    return leavePersonnel.filter(
      (p) => p.leaveType === 'P/Lve' || p.statusDetails?.toLowerCase().includes('privilege') || p.statusDetails?.toLowerCase().includes('p/lve')
    ).length;
  }, [leavePersonnel]);

  const cLeaveCount = useMemo(() => {
    return leavePersonnel.filter(
      (p) => p.leaveType === 'C/Lve' || p.statusDetails?.toLowerCase().includes('casual') || p.statusDetails?.toLowerCase().includes('c/lve')
    ).length;
  }, [leavePersonnel]);

  // Filtered list
  const filteredList = useMemo(() => {
    return leavePersonnel.filter((p) => {
      // Leave Type Filter
      const isPLeave = p.leaveType === 'P/Lve' || p.statusDetails?.toLowerCase().includes('privilege') || p.statusDetails?.toLowerCase().includes('p/lve');
      const isCLeave = p.leaveType === 'C/Lve' || p.statusDetails?.toLowerCase().includes('casual') || p.statusDetails?.toLowerCase().includes('c/lve');

      if (filterType === 'P/Lve' && !isPLeave) return false;
      if (filterType === 'C/Lve' && !isCLeave) return false;

      // Battery filter
      if (selectedBty !== 'ALL' && p.battery !== selectedBty) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSnk = p.snkNo.toLowerCase().includes(query);
        const matchRank = p.rk.toLowerCase().includes(query);
        const matchTrade = p.trade.toLowerCase().includes(query);
        const matchDetails = p.statusDetails?.toLowerCase().includes(query);
        const matchAddress = p.leaveAddress?.toLowerCase().includes(query);
        if (!matchName && !matchSnk && !matchRank && !matchTrade && !matchDetails && !matchAddress) {
          return false;
        }
      }

      return true;
    });
  }, [leavePersonnel, filterType, selectedBty, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
              <PlaneTakeoff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-sans tracking-tight">
                  Lve - Leave Nominal Roll
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {leavePersonnel.length} Soldiers On Leave
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
            {/* Top 2 Buttons: P/Lve & C/Lve */}
            <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === 'ALL'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Lve ({leavePersonnel.length})
              </button>
              <button
                onClick={() => setFilterType('P/Lve')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === 'P/Lve'
                    ? 'bg-purple-600 text-white shadow ring-2 ring-purple-400/40'
                    : 'bg-slate-850 hover:bg-slate-800 text-purple-300 border border-purple-500/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>P/Lve</span>
                <span className="ml-1 text-[10px] bg-purple-950 px-1.5 py-0.2 rounded text-purple-200">
                  {pLeaveCount}
                </span>
              </button>
              <button
                onClick={() => setFilterType('C/Lve')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === 'C/Lve'
                    ? 'bg-purple-600 text-white shadow ring-2 ring-purple-400/40'
                    : 'bg-slate-850 hover:bg-slate-800 text-purple-300 border border-purple-500/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>C/Lve</span>
                <span className="ml-1 text-[10px] bg-indigo-950 px-1.5 py-0.2 rounded text-indigo-200">
                  {cLeaveCount}
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
              placeholder="Search by Army No, Rank, Name, Trade, or Station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>
        </div>

        {/* Content Table / Nominal Roll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
              <PlaneTakeoff className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No personnel found on leave</p>
              <p className="text-xs text-slate-500 mt-1">
                Try switching between P/Lve or C/Lve filters or changing battery selection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-slate-800">
                    <th className="p-2.5">Ser</th>
                    <th className="p-2.5">Army No & Rank</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Trade</th>
                    <th className="p-2.5">Battery</th>
                    <th className="p-2.5">Lve Type</th>
                    <th className="p-2.5">Duration / Period</th>
                    <th className="p-2.5 bg-purple-950/40 text-purple-300">Joining Date (Re-Join)</th>
                    <th className="p-2.5">Address / Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredList.map((person, idx) => {
                    const isPLeave =
                      person.leaveType === 'P/Lve' ||
                      person.statusDetails?.toLowerCase().includes('privilege') ||
                      person.statusDetails?.toLowerCase().includes('p/lve');
                    const leaveTypeBadge = isPLeave ? 'P/Lve' : 'C/Lve';
                    const joining = person.joiningDate || (person.leaveTo ? `${person.leaveTo} (0630 hrs)` : 'Awaiting confirmation');

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
                        <td className="p-2.5 font-bold text-slate-100 whitespace-nowrap group-hover:text-purple-300 transition-colors">
                          {person.name}
                        </td>
                        <td className="p-2.5 font-mono text-slate-400">{person.trade}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700">
                            {person.battery}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                              isPLeave
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            }`}
                          >
                            {leaveTypeBadge}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-300">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Calendar className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>
                              {person.leaveFrom && person.leaveTo
                                ? `${person.leaveFrom} to ${person.leaveTo}`
                                : person.statusDetails || 'On sanctioned leave'}
                            </span>
                          </div>
                          {person.leaveDuration && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({person.leaveDuration})
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 bg-purple-950/20 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
                            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{joining}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-400 text-xs">
                          {person.leaveAddress ? (
                            <div className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span className="truncate">{person.leaveAddress}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-mono text-[11px]">-</span>
                          )}
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
            <span>Showing: <strong className="text-white">{filteredList.length}</strong> of {leavePersonnel.length} personnel</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-purple-400">Privilege (P/Lve): {pLeaveCount}</span>
            <span className="hidden sm:inline text-indigo-400">Casual (C/Lve): {cLeaveCount}</span>
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
