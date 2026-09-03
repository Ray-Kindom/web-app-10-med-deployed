import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubUnitConfig, RankConfig, RankCategory } from '../../types';
import {
  Shield,
  Layers,
  Award,
  Plus,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  Check,
  X,
} from 'lucide-react';

export const SubUnitsAndRanksTab: React.FC = () => {
  const {
    subUnitsList,
    addSubUnit,
    updateSubUnit,
    deleteSubUnit,
    ranksList,
    addRank,
    updateRank,
    deleteRank,
    isAdmin,
    showNotification,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'SUB_UNITS' | 'RANKS'>('SUB_UNITS');

  // Sub-Unit form
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<SubUnitConfig | null>(null);
  const [unitName, setUnitName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitRole, setUnitRole] = useState<'HQ' | 'GUN_BATTERY' | 'OTHER'>('GUN_BATTERY');

  // Rank form
  const [isAddingRank, setIsAddingRank] = useState(false);
  const [editingRank, setEditingRank] = useState<RankConfig | null>(null);
  const [rankName, setRankName] = useState('');
  const [rankBangla, setRankBangla] = useState('');
  const [rankCategory, setRankCategory] = useState<RankCategory>('OR');

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-amber-500/30 text-center space-y-3">
        <Shield className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">ADMIN Access Required</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Sub Units and Ranks structure is reserved for the System Administrator.
        </p>
      </div>
    );
  }

  const handleOpenAddUnit = () => {
    setUnitName('');
    setUnitCode('');
    setUnitRole('GUN_BATTERY');
    setEditingUnit(null);
    setIsAddingUnit(true);
  };

  const handleOpenEditUnit = (u: SubUnitConfig) => {
    setUnitName(u.name);
    setUnitCode(u.code);
    setUnitRole(u.role || 'GUN_BATTERY');
    setEditingUnit(u);
    setIsAddingUnit(true);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;

    if (editingUnit) {
      updateSubUnit(editingUnit.id, {
        name: unitName.trim(),
        code: unitCode.trim() || unitName.trim().toUpperCase(),
        role: unitRole,
      });
      showNotification(`Sub Unit "${unitName}" updated.`);
    } else {
      addSubUnit({
        name: unitName.trim(),
        code: unitCode.trim() || unitName.trim().toUpperCase(),
        role: unitRole,
        order: subUnitsList.length + 1,
        isActive: true,
      });
      showNotification(`Sub Unit "${unitName}" created.`);
    }
    setIsAddingUnit(false);
  };

  const handleOpenAddRank = () => {
    setRankName('');
    setRankBangla('');
    setRankCategory('OR');
    setEditingRank(null);
    setIsAddingRank(true);
  };

  const handleOpenEditRank = (r: RankConfig) => {
    setRankName(r.name);
    setRankBangla(r.banglaName || '');
    setRankCategory(r.category);
    setEditingRank(r);
    setIsAddingRank(true);
  };

  const handleSaveRank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rankName.trim()) return;

    if (editingRank) {
      updateRank(editingRank.id, {
        name: rankName.trim(),
        banglaName: rankBangla.trim(),
        category: rankCategory,
      });
      showNotification(`Rank "${rankName}" updated.`);
    } else {
      addRank({
        name: rankName.trim(),
        banglaName: rankBangla.trim(),
        category: rankCategory,
        order: ranksList.length + 1,
        isActive: true,
      });
      showNotification(`Rank "${rankName}" created.`);
    }
    setIsAddingRank(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('SUB_UNITS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'SUB_UNITS'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Sub Units & Batteries ({subUnitsList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('RANKS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'RANKS'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Military & Civilian Ranks ({ranksList.length})</span>
        </button>
      </div>

      {activeSubTab === 'SUB_UNITS' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Manage regiment batteries (HQ Battery, P Battery, Q Battery, R Battery). Admin can rename or add new sub-formations.
            </p>
            <button
              onClick={handleOpenAddUnit}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Sub Unit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subUnitsList.map((unit, idx) => (
              <div
                key={unit.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{unit.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {unit.code}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Role: {unit.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSubUnit(unit.id, { isActive: !unit.isActive })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      unit.isActive
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-slate-500 bg-slate-800 border-slate-700'
                    }`}
                  >
                    {unit.isActive ? 'Active' : 'Off'}
                  </button>

                  <button
                    onClick={() => handleOpenEditUnit(unit)}
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit Sub Unit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete Sub Unit "${unit.name}"?`)) {
                        deleteSubUnit(unit.id);
                      }
                    }}
                    className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800"
                    title="Delete Sub Unit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Manage ranks hierarchy (Officer, JCO, OR, Civilian, RCO). Admin can add or rename ranks.
            </p>
            <button
              onClick={handleOpenAddRank}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Rank</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {ranksList.map((rank, idx) => {
              const badgeColor =
                rank.category === 'OFFR'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                  : rank.category === 'JCO'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  : rank.category === 'CIVILIAN'
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                  : rank.category === 'RCO'
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';

              return (
                <div
                  key={rank.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 w-5">#{idx + 1}</span>
                    <div>
                      <span className="font-bold text-white">{rank.name}</span>
                      {rank.banglaName && (
                        <span className="text-[11px] text-slate-400 ml-1.5">({rank.banglaName})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeColor}`}>
                      {rank.category}
                    </span>

                    <button
                      onClick={() => handleOpenEditRank(rank)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete rank "${rank.name}"?`)) {
                          deleteRank(rank.id);
                        }
                      }}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Unit Modal */}
      {isAddingUnit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>{editingUnit ? 'Edit Sub Unit' : 'Create Sub Unit'}</span>
              <button onClick={() => setIsAddingUnit(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </h3>

            <form onSubmit={handleSaveUnit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sub Unit Name *</label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="e.g. S Bty, Attached Bty"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Code</label>
                <input
                  type="text"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  placeholder="e.g. S BTY"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role</label>
                <select
                  value={unitRole}
                  onChange={(e) => setUnitRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="GUN_BATTERY">Gun Battery</option>
                  <option value="HQ">Headquarters</option>
                  <option value="OTHER">Other Formation</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUnit(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rank Modal */}
      {isAddingRank && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>{editingRank ? 'Edit Rank' : 'Add Military / Civilian Rank'}</span>
              <button onClick={() => setIsAddingRank(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </h3>

            <form onSubmit={handleSaveRank} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rank Title *</label>
                <input
                  type="text"
                  value={rankName}
                  onChange={(e) => setRankName(e.target.value)}
                  placeholder="e.g. Major, Captain, Subedar, Civilian, RCO"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bangla Name (Optional)</label>
                <input
                  type="text"
                  value={rankBangla}
                  onChange={(e) => setRankBangla(e.target.value)}
                  placeholder="e.g. মেজর, ক্যাপ্টেন, সৈনিক, সিভিলিয়ান"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category Classification</label>
                <select
                  value={rankCategory}
                  onChange={(e) => setRankCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                >
                  <option value="OFFR">OFFR (Officer)</option>
                  <option value="JCO">JCO (Junior Commissioned Officer)</option>
                  <option value="OR">OR (Other Rank / Soldier)</option>
                  <option value="CIVILIAN">CIVILIAN (HQ Battery Others)</option>
                  <option value="RCO">RCO (HQ Battery Others)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingRank(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
