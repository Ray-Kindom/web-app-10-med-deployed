import React from 'react';

interface TradeBadgeProps {
  trade: string;
  size?: 'sm' | 'md';
  showDescription?: boolean;
}

export const TRADE_INFO: Record<string, { label: string; full: string; color: string; desc: string }> = {
  TA: {
    label: 'TA',
    full: 'Technical Assistant',
    color: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
    desc: 'Fire Direction, Artillery Computing & Survey',
  },
  OCU: {
    label: 'OCU',
    full: 'Operational Control Unit',
    color: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40',
    desc: 'Gun Command Post & Battery Fire Control',
  },
  DMT: {
    label: 'DMT',
    full: 'Driver Mechanical Transport',
    color: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    desc: 'Artillery Gun Towing Vehicle & Heavy Transport',
  },
  Gnr: {
    label: 'Gnr',
    full: 'Gunner Specialist',
    color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    desc: 'Gun Detachment, Layer & Breech Operation',
  },
  'Ck(U)': {
    label: 'Ck(U)',
    full: 'Cook (Unit)',
    color: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    desc: 'Regimental Ration & Battery Cookhouse',
  },
  Tech: {
    label: 'Tech',
    full: 'Technical Specialist',
    color: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
    desc: 'Artillery Equipment & Instrument Maintenance',
  },
  GD: {
    label: 'GD',
    full: 'General Duty',
    color: 'bg-slate-800 text-slate-300 border-slate-700',
    desc: 'Regimental Security, Duty & Operational Support',
  },
};

export const TradeBadge: React.FC<TradeBadgeProps> = ({
  trade,
  size = 'sm',
  showDescription = false,
}) => {
  const info = TRADE_INFO[trade] || {
    label: trade || 'GD',
    full: trade || 'General Duty',
    color: 'bg-slate-800 text-slate-300 border-slate-700',
    desc: 'Artillery Regimental Specialist',
  };

  return (
    <div className="inline-flex items-center gap-1.5" title={`${info.full}: ${info.desc}`}>
      <span
        className={`font-mono font-bold rounded border inline-flex items-center ${info.color} ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        {info.label}
      </span>
      {showDescription && (
        <span className="text-[10px] text-slate-400 font-sans hidden sm:inline truncate max-w-[120px]">
          {info.full}
        </span>
      )}
    </div>
  );
};
