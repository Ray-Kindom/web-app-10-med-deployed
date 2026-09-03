import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan' | 'slate' | 'indigo' | 'teal';
  percentage?: number;
  onClick?: () => void;
  badge?: string;
  active?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'blue',
  percentage,
  onClick,
  badge,
  active = false,
}) => {
  const schemeMap: Record<string, { bg: string; border: string; iconBg: string; accent: string; glow: string }> = {
    blue: {
      bg: 'from-blue-950/40 to-slate-900/80',
      border: 'border-blue-800/40 hover:border-blue-500/60',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      accent: 'text-blue-400',
      glow: 'shadow-blue-950/20',
    },
    emerald: {
      bg: 'from-emerald-950/40 to-slate-900/80',
      border: 'border-emerald-800/40 hover:border-emerald-500/60',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      accent: 'text-emerald-400',
      glow: 'shadow-emerald-950/20',
    },
    amber: {
      bg: 'from-amber-950/40 to-slate-900/80',
      border: 'border-amber-800/40 hover:border-amber-500/60',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      accent: 'text-amber-400',
      glow: 'shadow-amber-950/20',
    },
    purple: {
      bg: 'from-purple-950/40 to-slate-900/80',
      border: 'border-purple-800/40 hover:border-purple-500/60',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      accent: 'text-purple-400',
      glow: 'shadow-purple-950/20',
    },
    rose: {
      bg: 'from-rose-950/40 to-slate-900/80',
      border: 'border-rose-800/40 hover:border-rose-500/60',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      accent: 'text-rose-400',
      glow: 'shadow-rose-950/20',
    },
    cyan: {
      bg: 'from-cyan-950/40 to-slate-900/80',
      border: 'border-cyan-800/40 hover:border-cyan-500/60',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      accent: 'text-cyan-400',
      glow: 'shadow-cyan-950/20',
    },
    indigo: {
      bg: 'from-indigo-950/40 to-slate-900/80',
      border: 'border-indigo-800/40 hover:border-indigo-500/60',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      accent: 'text-indigo-400',
      glow: 'shadow-indigo-950/20',
    },
    teal: {
      bg: 'from-teal-950/40 to-slate-900/80',
      border: 'border-teal-800/40 hover:border-teal-500/60',
      iconBg: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
      accent: 'text-teal-400',
      glow: 'shadow-teal-950/20',
    },
    slate: {
      bg: 'from-slate-800/40 to-slate-900/80',
      border: 'border-slate-700/60 hover:border-slate-500',
      iconBg: 'bg-slate-700/40 text-slate-300 border border-slate-600/40',
      accent: 'text-slate-300',
      glow: 'shadow-slate-950/20',
    },
  };

  const scheme = schemeMap[colorScheme] || schemeMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-b ${scheme.bg} ${
        active ? 'ring-2 ring-rose-500/80 border-transparent' : scheme.border
      } p-4 sm:p-5 shadow-lg ${scheme.glow} transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
              {value}
            </span>
            {percentage !== undefined && (
              <span className={`text-xs font-semibold font-mono ${scheme.accent}`}>
                ({percentage}%)
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-2.5 rounded-lg ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{badge}</span>
        </div>
      )}
    </div>
  );
};
