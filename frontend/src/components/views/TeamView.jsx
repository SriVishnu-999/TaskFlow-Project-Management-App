import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Mail } from 'lucide-react';

export function TeamView() {
  const { teamMembers, currentProject } = useProject();

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Engineering Team Directory
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Active engineers and collaborators in {currentProject?.name || 'TaskFlow'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <div className="relative mb-3">
              <img
                src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.fullName}`}
                alt={member.fullName}
                className="w-16 h-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900 object-cover shadow-xs"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{member.fullName}</h3>
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800 mt-1">
              {member.role}
            </span>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[180px]">{member.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
