import React from 'react';
import { formatStatus } from '../../utils/formatters';

const STATUS_STYLES = {
  open: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  in_progress: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
};

const StatusPill = ({ status, className = '' }) => {
  const style = STATUS_STYLES[status] || 'bg-slate-700/50 text-slate-300 border-slate-600/30';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'open'
            ? 'bg-amber-400'
            : status === 'in_progress'
            ? 'bg-sky-400'
            : status === 'resolved'
            ? 'bg-emerald-400'
            : status === 'rejected'
            ? 'bg-rose-400'
            : 'bg-slate-400'
        }`}
      />
      {formatStatus(status)}
    </span>
  );
};

export default StatusPill;
