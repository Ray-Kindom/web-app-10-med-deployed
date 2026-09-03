import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Personnel } from '../../types';
import { RankBadge } from '../common/RankBadge';
import {
  X,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Search,
  Building,
  Award,
  BookOpen,
} from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersonnel?: (person: Personnel) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSelectPersonnel,
}) => {
  const { personnelList } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBty, setSelectedBty] = useState<string>('ALL');

  // Filter all personnel with status 'Course/Trg'
  const coursePersonnel = useMemo(() => {
    return personnelList.filter((p) => p.status === 'Course/Trg');
  }, [personnelList]);

  // Filtered list
  const filteredList = useMemo(() => {
    return coursePersonnel.filter((p) => {
      // Battery filter
      if (selectedBty !== 'ALL' && p.battery !== selectedBty) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSnk = p.snkNo.toLowerCase().includes(query);
        const matchRank = p.rk.toLowerCase().includes(query);
        const matchTrade = p.trade.toLowerCase().includes(query);
        const matchCourse = p.courseName?.toLowerCase().includes(query) || p.statusDetails?.toLowerCase().includes(query);
        const matchLocation = p.courseLocation?.toLowerCase().includes(query);
        if (!matchName && !matchSnk && !matchRank && !matchTrade && !matchCourse && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [coursePersonnel, selectedBty, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-sans tracking-tight">
                  Course - Cadre & Training Nominal Roll
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  {coursePersonnel.length} Soldiers On Course
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                10 Med Regt Arty Officers & Other Ranks attending professional gunnery & technical courses
              </p>
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/50 px-3 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Professional Training Roster</span>
              </span>
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
              placeholder="Search by Army No, Rank, Name, Course Name, or Training Center..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        </div>

        {/* Content Table / Nominal Roll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
              <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No personnel currently attending courses</p>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing search filter or switching battery selection.
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
                    <th className="p-2.5">Battery & Trade</th>
                    <th className="p-2.5 bg-cyan-950/40 text-cyan-300 font-bold">Course / Cadre Name</th>
                    <th className="p-2.5">Training Center / Location</th>
                    <th className="p-2.5 bg-rose-950/30 text-rose-300 font-bold">Course End Date (Kobe Sesh)</th>
                    <th className="p-2.5">Duration & Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredList.map((person, idx) => {
                    const courseTitle = person.courseName || person.statusDetails || 'Specialized Artillery Cadre';
                    const location = person.courseLocation || 'Artillery Centre & School (AC&S)';
                    const endDate = person.courseTo || 'Sep 2026';
                    const duration = person.courseDuration || (person.courseFrom ? `${person.courseFrom} to ${person.courseTo}` : 'In progress');

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
                        <td className="p-2.5 font-bold text-slate-100 whitespace-nowrap group-hover:text-cyan-300 transition-colors">
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
                        <td className="p-2.5 bg-cyan-950/20">
                          <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-sans">
                            <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{courseTitle}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{location}</span>
                          </div>
                        </td>
                        <td className="p-2.5 bg-rose-950/20 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-rose-300 bg-rose-950/40 px-2 py-1 rounded border border-rose-500/30">
                            <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>Ends: {endDate}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-400 text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>{duration}</span>
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
            <span>Total Officers & Other Ranks on Course: <strong className="text-cyan-400">{filteredList.length}</strong></span>
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
