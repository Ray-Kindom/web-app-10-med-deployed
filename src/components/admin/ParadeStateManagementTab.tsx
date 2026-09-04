import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ParadeTypeDefinition } from '../../types';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Shield,
  Clock,
  Sparkles,
  Layers,
  RotateCcw,
  Archive,
} from 'lucide-react';

export const ParadeStateManagementTab: React.FC = () => {
  const {
    paradeTypes,
    addParadeType,
    updateParadeType,
    deleteParadeType,
    restoreParadeType,
    isAdmin,
    showNotification,
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingType, setEditingType] = useState<ParadeTypeDefinition | null>(null);
  const [typeName, setTypeName] = useState('');
  const [typeHeadings, setTypeHeadings] = useState('');

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-amber-500/30 text-center space-y-3">
        <Shield className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">ADMIN Access Required</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Only the System Administrator has authority to add, edit, rename, or reorder Parade States.
        </p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setTypeName('');
    setTypeHeadings('OFFR, JCO, OR');
    setEditingType(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (t: ParadeTypeDefinition) => {
    setTypeName(t.name);
    setTypeHeadings(t.headings ? t.headings.join(', ') : 'OFFR, JCO, OR');
    setEditingType(t);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = typeName.trim();
    if (!trimmed) {
      showNotification('Parade State Name is required.');
      return;
    }

    const headings = typeHeadings
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    if (editingType) {
      updateParadeType(editingType.id, {
        name: trimmed,
        headings: headings.length > 0 ? headings : ['OFFR', 'JCO', 'OR'],
      });
      showNotification(`Parade State "${trimmed}" updated.`);
    } else {
      addParadeType(trimmed, headings.length > 0 ? headings : ['OFFR', 'JCO', 'OR']);
      showNotification(`Parade State "${trimmed}" created.`);
    }

    setIsAdding(false);
  };

  const activeTypes = paradeTypes.filter((t) => !t.isDeleted && !t.deleted);
  const archivedTypes = paradeTypes.filter((t) => t.isDeleted || t.deleted);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Parade State Types Manager
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              ADMIN CONTROL ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure system parade states (Morning Parade, Second Period, Games, etc.). Admins can create new parade events with customized reporting headers.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          id="btn-admin-add-parade-type"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Parade State</span>
        </button>
      </div>

      {/* Active Parade States Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Parade States ({activeTypes.length})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTypes.map((t, idx) => {
            return (
              <div
                key={t.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
                  t.isActive
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white">{t.name}</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {t.createdBy || 'Admin'}
                      </span>
                      <button
                        onClick={() => updateParadeType(t.id, { isActive: !t.isActive })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          t.isActive
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-slate-500 bg-slate-800 border-slate-700'
                        }`}
                      >
                        {t.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Headers:</span>
                    {(t.headings || ['OFFR', 'JCO', 'OR']).map((h) => (
                      <span
                        key={h}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold"
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {t.createdByName && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Author: <span className="text-slate-400">{t.createdByName}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Archive / Delete Parade State "${t.name}"? Record will be safely preserved in database archive.`)) {
                        deleteParadeType(t.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Soft-Delete / Archive Parade State"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Soft-Deleted / Archived Parade States Management (ADMIN ONLY) */}
      {archivedTypes.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
              <Archive className="w-3.5 h-3.5" />
              <span>Archived &amp; Soft-Deleted Parade States ({archivedTypes.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Admin can restore archived states anytime
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedTypes.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/80 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-400 line-through">{t.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Archived
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Created by: <span className="text-slate-300 font-semibold">{t.createdBy || 'Admin'}</span>
                  </p>
                  {t.deletedBy && (
                    <p className="text-[10px] text-slate-600 font-mono">
                      Deleted by: {t.deletedBy} ({t.deletedByRole})
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-900">
                  <button
                    onClick={() => restoreParadeType(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/30 transition-all cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Parade State</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-rose-400" />
                <span>{editingType ? 'Edit Parade State Type' : 'Create New Parade State Type'}</span>
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Parade State Name *
                </label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="e.g. Morning Parade, Evening Roll Call, Games..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Report Column Headers (comma separated)
                </label>
                <input
                  type="text"
                  value={typeHeadings}
                  onChange={(e) => setTypeHeadings(e.target.value)}
                  placeholder="OFFR, JCO, OR"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Default artillery standard is OFFR, JCO, OR
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  {editingType ? 'Save Changes' : 'Create Parade State'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
