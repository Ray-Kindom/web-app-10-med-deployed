import React from 'react';
import { ParadeStatus } from '../../types';

interface StatusBadgeProps {
  status: ParadeStatus | string;
  details?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  details,
  size = 'md',
  showDot = true,
}) => {
  const getStatusConfig = (st: string) => {
    switch (st) {
      case 'Present':
        return {
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-400 shadow-emerald-400/50',
          label: 'Present on Parade',
        };
      case 'On Duty':
        return {
          bg: 'bg-blue-500/15',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          dot: 'bg-blue-400 shadow-blue-400/50',
          label: 'On Duty / Guard',
        };
      case 'CMH/Sick':
        return {
          bg: 'bg-amber-500/15',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          dot: 'bg-amber-400 shadow-amber-400/50',
          label: 'CMH / Sick Report',
        };
      case 'Leave':
        return {
          bg: 'bg-purple-500/15',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          dot: 'bg-purple-400 shadow-purple-400/50',
          label: 'Leave / Furlough',
        };
      case 'Course/Trg':
        return {
          bg: 'bg-cyan-500/15',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30',
          dot: 'bg-cyan-400 shadow-cyan-400/50',
          label: 'Course / Training',
        };
      case 'Temp Duty':
        return {
          bg: 'bg-indigo-500/15',
          text: 'text-indigo-400',
          border: 'border-indigo-500/30',
          dot: 'bg-indigo-400 shadow-indigo-400/50',
          label: 'Temporary Duty',
        };
      case 'Attached Out':
        return {
          bg: 'bg-teal-500/15',
          text: 'text-teal-400',
          border: 'border-teal-500/30',
          dot: 'bg-teal-400 shadow-teal-400/50',
          label: 'Attached Out',
        };
      case 'AWOL/OSL':
        return {
          bg: 'bg-rose-500/15',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          dot: 'bg-rose-400 shadow-rose-400/50',
          label: 'AWOL / OSL',
        };
      default:
        return {
          bg: 'bg-slate-700/50',
          text: 'text-slate-300',
          border: 'border-slate-600',
          dot: 'bg-slate-400',
          label: st,
        };
    }
  };

  const config = getStatusConfig(status || 'Present');

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} tracking-tight whitespace-nowrap`}
      >
        {showDot && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${config.dot} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
          />
        )}
        <span>{config.label}</span>
      </span>
      {details && (
        <span className="text-[10px] text-slate-400 pl-1 max-w-[170px] truncate" title={details}>
          {details}
        </span>
      )}
    </div>
  );
};
