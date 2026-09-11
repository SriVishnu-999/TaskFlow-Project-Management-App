import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Plus, Layers, Clock, Eye, CheckCircle2 } from 'lucide-react';

export function KanbanColumn({ 
  column, 
  tasks, 
  onSelectTask, 
  onMoveTask, 
  onDeleteTask, 
  onQuickAddTask,
  allColumns 
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, column.id, column.statusMapping);
    }
  };

  const columnStyles = {
    Backlog: { accent: 'bg-slate-400', border: 'border-slate-300 dark:border-slate-700', icon: Layers },
    Todo: { accent: 'bg-amber-500', border: 'border-amber-300 dark:border-amber-700', icon: Clock },
    InProgress: { accent: 'bg-indigo-600', border: 'border-indigo-300 dark:border-indigo-700', icon: Clock },
    InReview: { accent: 'bg-purple-600', border: 'border-purple-300 dark:border-purple-700', icon: Eye },
    Done: { accent: 'bg-emerald-600', border: 'border-emerald-300 dark:border-emerald-700', icon: CheckCircle2 }
  };

  const style = columnStyles[column.statusMapping] || columnStyles.Todo;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-80 shrink-0 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3 border transition-all duration-200 min-h-[550px] ${
        isDragOver 
          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-200 dark:ring-indigo-900 shadow-lg' 
          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 py-1.5 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${style.accent}`} />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">
            {column.name}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onQuickAddTask(column.id, column.statusMapping)}
          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={`Add task to ${column.name}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List Container */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 min-h-[100px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onSelect={onSelectTask}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            columns={allColumns}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-750 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-4 text-center">
            <span className="text-xs">No tasks in this column</span>
            <button
              type="button"
              onClick={() => onQuickAddTask(column.id, column.statusMapping)}
              className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Create one</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Button at Bottom */}
      <button
        type="button"
        onClick={() => onQuickAddTask(column.id, column.statusMapping)}
        className="mt-3 w-full py-2 px-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Task</span>
      </button>
    </div>
  );
}
