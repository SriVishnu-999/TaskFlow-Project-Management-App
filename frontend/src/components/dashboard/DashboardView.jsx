import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { useProject } from '../../context/ProjectContext';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Activity,
  RefreshCw
} from 'lucide-react';

export function DashboardView() {
  const { currentProject } = useProject();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!currentProject) return;
    setIsLoading(true);
    try {
      const data = await analyticsApi.getProjectAnalytics(currentProject.id);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentProject?.id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Calculating sprint velocity metrics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sprint Analytics & Velocity
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time delivery throughput and bottleneck tracking for {analytics.projectName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAnalytics}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Calculated via ASP.NET Core EF Core</span>
          </div>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Completion Rate */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{analytics.completionPercentage}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">of total tasks</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${analytics.completionPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex justify-between">
            <span>{analytics.completedTasks} completed</span>
            <span>{analytics.totalTasks} total</span>
          </div>
        </div>

        {/* Story Points Throughput */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Story Points Velocity</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{analytics.completedStoryPoints}</span>
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/ {analytics.totalStoryPoints} pts</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${analytics.totalStoryPoints > 0 ? (analytics.completedStoryPoints / analytics.totalStoryPoints) * 100 : 0}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex justify-between">
            <span>Points delivered</span>
            <span>Estimated total</span>
          </div>
        </div>

        {/* In Flight Tasks */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>In Flight Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{analytics.inProgressTasks}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">active items</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Currently being worked on across sprint engineers
          </p>
        </div>

        {/* Overdue Items */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Overdue Warnings</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              analytics.overdueTasks > 0 ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${analytics.overdueTasks > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {analytics.overdueTasks}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">tasks past due</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {analytics.overdueTasks > 0 ? 'Action required by assignees' : 'All delivery targets on track'}
          </p>
        </div>
      </div>

      {/* Mid section: Priority Distribution & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Tasks by Priority
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Distribution of workload severity across sprint backlog
          </p>

          <div className="space-y-4">
            {analytics.priorityBreakdown.map((item) => {
              const pct = analytics.totalTasks > 0 ? Math.round((item.count / analytics.totalTasks) * 100) : 0;
              return (
                <div key={item.priority} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{item.priority}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{item.count} tasks ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${pct}%`, 
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Status Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Lifecycle distribution from Backlog to Done
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {analytics.statusBreakdown.map((item) => (
              <div key={item.status} className="bg-slate-50 dark:bg-slate-750 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.count}</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{item.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Feed */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Engineering Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live audit trail of task creations, updates, and status transitions
            </p>
          </div>
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {analytics.recentActivities.length > 0 ? (
            analytics.recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {act.taskKey}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{act.taskTitle}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{act.userName}</span>: {act.description}
                  </div>
                </div>
                <span className="text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No recent activities recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
