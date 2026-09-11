import React from 'react';
import { 
  Kanban, 
  BarChart3, 
  FolderKanban, 
  Users, 
  CheckCircle2, 
  Clock, 
  Flame 
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export function Sidebar({ currentView, onViewChange, taskStats }) {
  const { currentProject } = useProject();

  const navItems = [
    { id: 'board', label: 'Kanban Board', icon: Kanban },
    { id: 'analytics', label: 'Analytics & Velocity', icon: BarChart3 },
    { id: 'projects', label: 'Projects Overview', icon: FolderKanban },
    { id: 'team', label: 'Team Directory', icon: Users }
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xs flex flex-col justify-between py-5 px-3 select-none transition-colors">
      <div className="space-y-6">
        {/* Current Project Card */}
        {currentProject && (
          <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-indigo-950/40 dark:to-slate-850 border border-indigo-100/80 dark:border-indigo-900/60 rounded-xl p-3 transition-colors">
            <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1">
              Active Project
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
              {currentProject.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span className="font-mono font-medium text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800 text-[10px]">
                {currentProject.key}
              </span>
              <span>{taskStats?.total || currentProject.taskCount || 0} tasks tracked</span>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Stats in Sidebar */}
        {taskStats && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Sprint Health
            </div>
            <div className="px-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Completed
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{taskStats.done || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  In Progress
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{taskStats.inProgress || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                  Urgent Items
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{taskStats.urgent || 0}</span>
              </div>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span>Sprint Velocity</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{taskStats.completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${taskStats.completionPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center transition-colors">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">ASP.NET 9 + React</div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Clean Architecture • SQL Server</div>
      </div>
    </aside>
  );
}
