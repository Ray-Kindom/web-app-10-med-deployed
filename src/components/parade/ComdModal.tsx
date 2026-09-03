import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Personnel } from '../../types';
import { RankBadge } from '../common/RankBadge';
import {
  X,
  Shield,
  Calendar,
  Clock,
  MapPin,
  Search,
  Building,
  Briefcase,
  FileCheck,
  Compass,
} from 'lucide-react';

interface ComdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersonnel?: (person: Personnel) => void;
}

export const ComdModal: React.FC<ComdModalProps> = ({
  isOpen,
  onClose,
  onSelectPersonnel,
}) => {
  const { personnelList } = useApp();
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'TEMP_DUTY' | 'ATTACHED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBty, setSelectedBty] = useState<string>('ALL');

  // Filter all personnel with status 'Temp Duty' or 'Attached Out' or with comdAssignment
  const comdPersonnel = useMemo(() => {
    return personnelList.filter(
      (p) => p.status === 'Temp Duty' || p.status === 'Attached Out' || Boolean(p.comdAssignment)
    );
  }, [personnelList]);

  // Counts
  const tempDutyCount = useMemo(() => {
    return comdPersonnel.filter((p) => p.status === 'Temp Duty').length;
  }, [comdPersonnel]);

  const attachedCount = useMemo(() => {
    return comdPersonnel.filter((p) => p.status === 'Attached Out').length;
  }, [comdPersonnel]);

  // Filtered list
  const filteredList = useMemo(() => {
    return comdPersonnel.filter((p) => {
      // Category Filter
      if (filterCategory === 'TEMP_DUTY' && p.status !== 'Temp Duty') return false;
      if (filterCategory === 'ATTACHED' && p.status !== 'Attached Out') return false;

      // Battery filter
      if (selectedBty !== 'ALL' && p.battery !== selectedBty) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSnk = p.snkNo.toLowerCase().includes(query);
        const matchRank = p.rk.toLowerCase().includes(query);
        const matchTrade = p.trade.toLowerCase().includes(query);
        const matchAssign = p.comdAssignment?.toLowerCase().includes(query) || p.statusDetails?.toLowerCase().includes(query);
        const matchLoc = p.comdLocation?.toLowerCase().includes(query);
        const matchAuth = p.comdAuthority?.toLowerCase().includes(query);
        if (!matchName && !matchSnk && !matchRank && !matchTrade && !matchAssign && !matchLoc && !matchAuth) {
          return false;
        }
      }

      return true;
    });
  }, [comdPersonnel, filterCategory, selectedBty, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-sans tracking-tight">
                  COMD - Command Duty & Attachment Nominal Roll
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {comdPersonnel.length} On Command Assignment
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
            {/* Category Buttons */}
            <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterCategory === 'ALL'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All COMD ({comdPersonnel.length})
              </button>
              <button
                onClick={() => setFilterCategory('TEMP_DUTY')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterCategory === 'TEMP_DUTY'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-850 hover:bg-slate-800 text-indigo-300 border border-indigo-500/20'
                }`}
              >
                <span>Temp Duty (TD)</span>
                <span className="ml-1 text-[10px] bg-indigo-950 px-1.5 py-0.2 rounded text-indigo-200">
                  {tempDutyCount}
                </span>
              </button>
              <button
                onClick={() => setFilterCategory('ATTACHED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterCategory === 'ATTACHED'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-850 hover:bg-slate-800 text-teal-300 border border-teal-500/20'
                }`}
              >
                <span>Attached Out</span>
                <span className="ml-1 text-[10px] bg-teal-950 px-1.5 py-0.2 rounded text-teal-200">
                  {attachedCount}
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
              placeholder="Search by Army No, Rank, Name, Mission / Assignment, Location, or Authority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>
        </div>

        {/* Content Table / Nominal Roll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
              <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No personnel on external command assignment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-slate-800">
                    <th className="p-2.5">Ser</th>
                    <th className="p-2.5">Army No & Rank</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Battery & Trade</th>
                    <th className="p-2.5 bg-indigo-950/40 text-indigo-300 font-bold">Assignment / Mission</th>
                    <th className="p-2.5">Station / Location</th>
                    <th className="p-2.5">Duration / Period</th>
                    <th className="p-2.5">Order / Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredList.map((person, idx) => {
                    const isAttached = person.status === 'Attached Out';
                    const assignment = person.comdAssignment || person.statusDetails || 'Command Assignment';
                    const location = person.comdLocation || 'External Formation';
                    const dates = person.comdFrom && person.comdTo ? `${person.comdFrom} to ${person.comdTo}` : 'Active Assignment';
                    const auth = person.comdAuthority || 'AHQ / Bde Order';

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
                        <td className="p-2.5 font-bold text-slate-100 whitespace-nowrap group-hover:text-indigo-300 transition-colors">
                          {person.name}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700">
                              {person.battery}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">({person.trade})</span>
                          </div>
                        </td>
                        <td className="p-2.5 bg-indigo-950/20">
                          <div className="flex items-center gap-1.5 text-indigo-200 font-bold font-sans">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{assignment}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{location}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-300 whitespace-nowrap font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>{dates}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-400 text-xs font-mono">
                          <div className="flex items-center gap-1">
                            <FileCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{auth}</span>
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
          <div>
            <span>Total COMD Personnel: <strong className="text-indigo-400">{filteredList.length}</strong></span>
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
