import React from 'react';

interface RankBadgeProps {
  rank: string;
  trade?: string;
  size?: 'sm' | 'md';
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  trade,
  size = 'md',
}) => {
  const getRankStyle = (rk: string) => {
    switch (rk) {
      case 'Lt Col':
      case 'Maj':
      case 'Capt':
      case 'Lt':
      case '2Lt':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          category: 'Officer',
        };
      case 'MWO':
      case 'SWO':
      case 'WO':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          category: 'JCO',
        };
      case 'Sgt':
      case 'Cpl':
      case 'Lcpl':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          category: 'OR',
        };
      case 'Civilian':
      case 'NC(E)':
      case 'NC(U)':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          category: 'Civilian',
        };
      case 'RCO':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          category: 'RCO',
        };
      case 'Snk':
      case 'Gnr':
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          category: 'OR',
        };
    }
  };

  const style = getRankStyle(rank || 'Snk');

  return (
    <div className="inline-flex items-center gap-1.5 font-mono">
      <span
        className={`inline-flex items-center font-bold rounded border ${style.bg} ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
        }`}
      >
        {rank}
      </span>
      {trade && (
        <span
          className={`font-medium text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 ${
            size === 'sm' ? 'text-[9px]' : 'text-[10px]'
          }`}
          title={`Trade: ${trade}`}
        >
          {trade}
        </span>
      )}
    </div>
  );
};
