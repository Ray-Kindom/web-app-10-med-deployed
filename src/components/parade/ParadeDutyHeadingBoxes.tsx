import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ParadeDutyCategory, ParadeDutyAssignment, Battery, ALL_BATTERIES } from '../../types';
import {
  Shield,
  Wrench,
  Clock,
  Layers,
  Search,
  Plus,
  Trash2,
  X,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronDown,
} from 'lucide-react';

interface ParadeDutyHeadingBoxesProps {
  date: string;
  sessionType: string;
  isReadOnly?: boolean;
  filterBattery?: Battery | 'Consolidated';
}

interface DutyBoxDefinition {
  category: ParadeDutyCategory;
  num: string;
  title: string;
  subTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  colorScheme: 'emerald' | 'amber' | 'indigo' | 'rose';
  defaultRoles: string[];
}

const DUTY_BOXES: DutyBoxDefinition[] = [
  {
    category: 'Unit Sy',
    num: '1.',
    title: 'Unit Sy',
    subTitle: 'Unit Security & Guards (ক্যাম্প সিকিউরিটি)',
    icon: Shield,
    colorScheme: 'emerald',
    defaultRoles: [
      'Regt Guard (রেজিমেন্টাল গার্ড)',
      'Main Gate Guard (মেইন গেট গার্ড)',
      'RP Duty (রেজিমেন্টাল পুলিশ)',
      'Magazine Guard (ম্যাগাজিন গার্ড)',
      'Quarter Guard (কোয়ার্টার গার্ড)',
      'Kot Guard (কোট গার্ড)',
      'Perimeter Patrol (পেরিমিটার পেট্রোল)',
      'Camp Security (সিকিউরিটি ডিউটি)',
    ],
  },
  {
    category: 'working',
    num: '2.',
    title: 'working',
    subTitle: 'Working Party & Fatigue (ওয়ার্কিং পার্টি)',
    icon: Wrench,
    colorScheme: 'amber',
    defaultRoles: [
      'Camp Cleaning (ক্যাম্প পরিষ্কার)',
      'Fresh Ration Party (ফ্রেশ রেশন পার্টি)',
      'Dry Ration Party (ড্রাই রেশন পার্টি)',
      'Ammo Working (অ্যামোনিশন ওয়ার্কিং)',
      'Store Working (স্টোর ওয়ার্কিং)',
      'MT Maintenance / Wash (এমটি রক্ষণাবেক্ষণ)',
      'Line Maintenance (লাইন ফ্যাটিগ)',
      'Fire Fighting Party (ফায়ার ফাইটিং)',
    ],
  },
  {
    category: 'Fixed Duty',
    num: '3.',
    title: 'Fixed Duty',
    subTitle: 'Fixed Regimental Duties (ফিক্সড ডিউটি)',
    icon: Clock,
    colorScheme: 'indigo',
    defaultRoles: [
      'Cook / Cookhouse (কুক / মেস স্টাফ)',
      'MT Driver (এমটি ড্রাইভার)',
      'Radio Operator (রেডিও অপারেটর/সিগস)',
      'Bty Clerk / Office (ব্যাটারি ক্লার্ক / অফিস)',
      'Water Carrier (ওয়াটার ক্যারিয়ার)',
      'Electrician / Gen Op (ইলেকট্রিশিয়ান / জেনারেটর)',
      'Armament Artificer (আর্মামেন্ট আর্টিফিসার)',
      'Barber / Cobbler / Washerman (বারবার / মুচি)',
    ],
  },
  {
    category: 'Others',
    num: '4.',
    title: 'Others',
    subTitle: 'Other Out & Station Duties (অন্যান্য ডিউটি)',
    icon: Layers,
    colorScheme: 'rose',
    defaultRoles: [
      'General Duty (GD) (জেনারেল ডিউটি)',
      'Special Assignment (স্পেশাল ডিউটি)',
      'MI Room Attendant (এমআই রুম / মেডিকেল)',
      'Sports Cadre (স্পোর্টস ক্যাডার)',
      'Escort Duty (এসকোর্ট ডিউটি)',
      'Admin Duty (অ্যাডমিন ডিউটি)',
    ],
  },
];

export const ParadeDutyHeadingBoxes: React.FC<ParadeDutyHeadingBoxesProps> = ({
  date,
  sessionType,
  isReadOnly = false,
  filterBattery,
}) => {
  const {
    personnelList,
    getParadeDutyAssignments,
    addParadeDutyAssignment,
    removeParadeDutyAssignment,
    clearParadeDutyAssignments,
    showNotification,
    currentUser,
  } = useApp();

  // Selected Active Category Box (null means collapsed, or defaults to open on first category when clicked)
  const [activeCategory, setActiveCategory] = useState<ParadeDutyCategory | null>(null);

  // Selected Duty Name from dropdown
  const [selectedDutyName, setSelectedDutyName] = useState<string>('');
  const [customDutyInput, setCustomDutyInput] = useState<string>('');
  const [isCustomDuty, setIsCustomDuty] = useState(false);

  // Snk No / Name Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Current assignments for this date and session
  const allAssignments = getParadeDutyAssignments(date, sessionType);

  // Filter assignments by battery if filterBattery is a specific battery
  const displayAssignments = useMemo(() => {
    if (!filterBattery || filterBattery === 'Consolidated') {
      return allAssignments;
    }
    return allAssignments.filter((a) => a.battery === filterBattery);
  }, [allAssignments, filterBattery]);

  // Counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<ParadeDutyCategory, number> = {
      'Unit Sy': 0,
      working: 0,
      'Fixed Duty': 0,
      Others: 0,
    };
    displayAssignments.forEach((a) => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      }
    });
    return counts;
  }, [displayAssignments]);

  // Active box definition
  const activeBoxDef = useMemo(() => {
    return DUTY_BOXES.find((b) => b.category === activeCategory);
  }, [activeCategory]);

  // When active category changes, set default dropdown duty option
  useEffect(() => {
    if (activeCategory && activeBoxDef) {
      setSelectedDutyName(activeBoxDef.defaultRoles[0] || '');
      setIsCustomDuty(false);
      setCustomDutyInput('');
      setSearchQuery('');
      setIsSearchOpen(false);
      // Auto-focus search box
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [activeCategory, activeBoxDef]);

  // Click outside listener for search autocomplete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter personnel based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return personnelList
      .filter((p) => {
        // Battery constraint if filtered
        if (filterBattery && filterBattery !== 'Consolidated' && p.battery !== filterBattery) {
          return false;
        }
        const matchesArmyNo = p.armyNo.toLowerCase().includes(q);
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesRank = p.rank.toLowerCase().includes(q);
        return matchesArmyNo || matchesName || matchesRank;
      })
      .slice(0, 10);
  }, [personnelList, searchQuery, filterBattery]);

  // Handle adding a soldier
  const handleAddSoldier = (soldier: (typeof personnelList)[0]) => {
    if (!activeCategory) return;
    if (isReadOnly) {
      showNotification('View-Only mode: Cannot add duty personnel.');
      return;
    }

    const finalDuty = isCustomDuty && customDutyInput.trim() ? customDutyInput.trim() : selectedDutyName;

    if (!finalDuty) {
      showNotification('Please select or enter a duty name first.');
      return;
    }

    // Check if already assigned to this duty
    const alreadyAssigned = allAssignments.some(
      (a) => a.personnelId === soldier.id && a.category === activeCategory
    );

    addParadeDutyAssignment({
      personnelId: soldier.id,
      snkNo: soldier.armyNo,
      name: soldier.name,
      rank: soldier.rank,
      battery: soldier.battery,
      category: activeCategory,
      dutyName: finalDuty,
      date,
      sessionType,
    });

    if (alreadyAssigned) {
      showNotification(`Updated ${soldier.rank} ${soldier.name} duty to: ${finalDuty}`);
    } else {
      showNotification(`✅ Added ${soldier.rank} ${soldier.name} (${soldier.armyNo}) to ${activeCategory}!`);
    }

    // Clear search and refocus so more soldiers can be continuously added ("evabe aro add kora jaabe")
    setSearchQuery('');
    setIsSearchOpen(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleBoxClick = (cat: ParadeDutyCategory) => {
    if (activeCategory === cat) {
      // Toggle or keep open
      setActiveCategory(cat);
    } else {
      setActiveCategory(cat);
    }
  };

  const activeCategoryAssignments = useMemo(() => {
    if (!activeCategory) return [];
    return displayAssignments.filter((a) => a.category === activeCategory);
  }, [displayAssignments, activeCategory]);

  return (
    <div className="w-full space-y-3 bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl">
      {/* Top Banner / Heading Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase font-sans flex items-center gap-2">
              <span>Duty &amp; Working Personnel Roster (ডিউটি ও ওয়ার্কিং পার্সোনেল এন্ট্রি)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {displayAssignments.length} Total Detailed
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Click any heading box below to assign soldiers to Unit Sy, Working, Fixed Duty, or Others.
            </p>
          </div>
        </div>

        {activeCategory && (
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className="self-end sm:self-auto text-[11px] font-mono font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 transition-colors"
          >
            Close Panel ✕
          </button>
        )}
      </div>

      {/* 4 HEADING BOXES (1. Unit Sy, 2. working, 3. Fixed Duty, 4. Others) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {DUTY_BOXES.map((box) => {
          const Icon = box.icon;
          const isSelected = activeCategory === box.category;
          const count = categoryCounts[box.category];

          // Dynamic colors based on category
          const colorClasses = {
            emerald: {
              activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/40',
              hoverBorder: 'hover:border-emerald-500/60',
              iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              textColor: 'text-emerald-400',
            },
            amber: {
              activeBorder: 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-950/40',
              hoverBorder: 'hover:border-amber-500/60',
              iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              textColor: 'text-amber-400',
            },
            indigo: {
              activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/40',
              hoverBorder: 'hover:border-indigo-500/60',
              iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
              badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
              textColor: 'text-indigo-400',
            },
            rose: {
              activeBorder: 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-950/40',
              hoverBorder: 'hover:border-rose-500/60',
              iconBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
              textColor: 'text-rose-400',
            },
          }[box.colorScheme];

          return (
            <div
              key={box.category}
              id={`duty-heading-box-${box.category.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleBoxClick(box.category)}
              className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? `${colorClasses.activeBorder} shadow-lg`
                  : `bg-slate-900/90 border-slate-800 ${colorClasses.hoverBorder} hover:bg-slate-800/80`
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono text-slate-400">
                      {box.num}
                    </span>
                    <h5
                      className={`text-sm sm:text-base font-black tracking-tight ${
                        isSelected ? colorClasses.textColor : 'text-white group-hover:text-slate-200'
                      }`}
                    >
                      {box.title}
                    </h5>
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border text-xs flex items-center justify-center ${colorClasses.iconBg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">
                  {box.subTitle}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Detailed:</span>
                <span
                  className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${
                    count > 0 ? colorClasses.badge : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {count > 0 ? `${count} Soldiers` : '0 Soldiers'}
                </span>
              </div>

              {isSelected && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45" />
              )}
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE DUTY ASSIGNMENT PANEL (Opens when a box is clicked) */}
      {activeCategory && activeBoxDef && (
        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/95 border border-slate-700/90 shadow-2xl space-y-3.5 animate-fadeIn">
          {/* Active Box Label & Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ACTIVE: {activeBoxDef.num} {activeBoxDef.title}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Assigned: <strong className="text-white font-bold">{activeCategoryAssignments.length}</strong>
              </span>
            </div>

            {activeCategoryAssignments.length > 0 && !isReadOnly && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Clear all ${activeCategory} assignments for this session?`)) {
                    clearParadeDutyAssignments(date, sessionType, activeCategory);
                  }
                }}
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All ({activeCategory})</span>
              </button>
            )}
          </div>

          {/* THE REQUESTED CORE CONTROL ROW: Dropdown Box on Left + Snk No/Name Search on Right */}
          {!isReadOnly ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
              {/* 1. DROPDOWN BOX ("ekta drop down box ashbe") */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-300 flex items-center justify-between">
                  <span>1. Select Duty Role / সাব-ডিউটি:</span>
                  {isCustomDuty && (
                    <button
                      type="button"
                      onClick={() => setIsCustomDuty(false)}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      ← Back to list
                    </button>
                  )}
                </label>

                {!isCustomDuty ? (
                  <div className="relative">
                    <select
                      value={selectedDutyName}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsCustomDuty(true);
                          setCustomDutyInput('');
                        } else {
                          setSelectedDutyName(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-rose-500 transition-colors appearance-none cursor-pointer pr-8"
                    >
                      {activeBoxDef.defaultRoles.map((role) => (
                        <option key={role} value={role} className="bg-slate-900 text-white py-1">
                          {role}
                        </option>
                      ))}
                      <option value="__CUSTOM__" className="bg-slate-900 text-cyan-400 font-bold py-1">
                        ➕ Custom Duty (কাস্টম নাম লিখুন)...
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={customDutyInput}
                    onChange={(e) => setCustomDutyInput(e.target.value)}
                    placeholder="Enter Custom Duty name..."
                    className="w-full bg-slate-950 border border-cyan-500/60 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                    autoFocus
                  />
                )}
              </div>

              {/* 2. SNK NO / NAME SEARCH BOX ("tar dane snk no/naam search korar box ashbe") */}
              <div className="md:col-span-7 space-y-1 relative" ref={dropdownRef}>
                <label className="text-[11px] font-mono font-bold text-slate-300 flex items-center justify-between">
                  <span>2. Search Snk No / Name (সৈনিক নং বা নাম সার্চ করুন):</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Type to search &amp; hit Enter / Click to Add
                  </span>
                </label>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => {
                      if (searchQuery.trim()) setIsSearchOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        e.preventDefault();
                        handleAddSoldier(searchResults[0]);
                      } else if (e.key === 'Escape') {
                        setIsSearchOpen(false);
                      }
                    }}
                    placeholder="Search by Snk No (e.g. 144567) or Name..."
                    className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Instant Search Autocomplete Dropdown */}
                {isSearchOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50 p-1 divide-y divide-slate-800">
                    {searchResults.length > 0 ? (
                      searchResults.map((soldier) => {
                        const isAlready = allAssignments.some(
                          (a) => a.personnelId === soldier.id && a.category === activeCategory
                        );

                        return (
                          <div
                            key={soldier.id}
                            onClick={() => handleAddSoldier(soldier)}
                            className="p-2.5 hover:bg-slate-900 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700">
                                {soldier.armyNo}
                              </span>
                              <div>
                                <div className="text-xs font-bold text-white group-hover:text-rose-300">
                                  {soldier.rank} {soldier.name}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  {soldier.battery} • {soldier.trade || 'GD'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isAlready ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Already in {activeCategory}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 shadow"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 font-mono">
                        No soldiers found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-mono">
              View-Only Mode: Only BSM, RSM, or Admin can detail soldiers to duty.
            </div>
          )}

          {/* LIST OF ADDED SOLDIERS IN THIS CATEGORY ("tar naam add and evabe aro add kora jaabe") */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                Detailed Soldiers in {activeCategory} ({activeCategoryAssignments.length}):
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Sorted by assignment
              </span>
            </div>

            {activeCategoryAssignments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {activeCategoryAssignments.map((assigned, idx) => (
                  <div
                    key={assigned.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 flex items-center justify-between gap-2 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{assigned.rank} {assigned.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 rounded border border-cyan-800/60">
                            {assigned.snkNo}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                          <span className="text-slate-300">{assigned.battery}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold truncate">
                            {assigned.dutyName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeParadeDutyAssignment(assigned.id, date, sessionType)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Remove soldier from this duty"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-mono">
                  No soldiers assigned to <strong>{activeCategory}</strong> yet for {sessionType}.
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Select a duty role above, type soldier's Snk No (Army No) or Name in the search box, and click Add.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
