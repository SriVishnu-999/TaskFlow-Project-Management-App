import React from 'react';
import { AlertCircle, ArrowDown, ArrowUp, Flame, CheckCircle2, Clock, Eye, Layers } from 'lucide-react';

export function PriorityBadge({ priority, size = 'sm' }) {
  const p = typeof priority === 'string' ? priority.toLowerCase() : String(priority);

  const configs = {
    urgent: { label: 'Urgent', bg: 'bg-red-50 text-red-700 border-red-200', icon: Flame },
    high: { label: 'High', bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: ArrowUp },
    medium: { label: 'Medium', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: ArrowDown },
    low: { label: 'Low', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ArrowDown }
  };

  const current = configs[p] || configs.medium;
  const Icon = current.icon;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${current.bg} ${sizeClass}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {current.label}
    </span>
  );
}

export function StatusBadge({ status, size = 'sm' }) {
  const s = typeof status === 'string' ? status.toLowerCase() : String(status);

  const configs = {
    backlog: { label: 'Backlog', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Layers },
    todo: { label: 'To Do', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    inprogress: { label: 'In Progress', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Clock },
    inreview: { label: 'In Review', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Eye },
    done: { label: 'Done', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 }
  };

  const current = configs[s] || configs.todo;
  const Icon = current.icon;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${current.bg} ${sizeClass}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {current.label}
    </span>
  );
}
