import React, { useState } from 'react';
import { PriorityBadge } from '../common/Badge';
import { Calendar, Clock, MoreVertical, Trash2, ArrowRight } from 'lucide-react';

export function TaskCard({ task, onSelect, onMoveTask, onDeleteTask, columns }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(task)}
      className={`group relative bg-white dark:bg-slate-800 rounded-xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md ${
        isDragging 
          ? 'opacity-40 scale-95 border-indigo-500' 
          : 'border-slate-200/90 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
      }`}
    >
      {/* Top row: Key, Priority, and Quick actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
            {task.taskKey}
          </span>
          <PriorityBadge priority={task.priority} size="sm" />
        </div>

        {/* Story points & menu */}
        <div className="flex items-center gap-1">
          {task.storyPoints > 0 && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
              {task.storyPoints} pts
            </span>
          )}

          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="More options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div 
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-1 font-semibold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Move to column
                </div>
                {columns?.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    disabled={col.id === task.boardColumnId}
                    onClick={() => {
                      onMoveTask(task.id, col.id, col.statusMapping);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer ${
                      col.id === task.boardColumnId 
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold' 
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>{col.name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTask(task.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Due date & Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
        {task.dueDate ? (
          <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            {isOverdue && <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-1 rounded">Overdue</span>}
          </div>
        ) : (
          <div className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>No due date</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {task.assigneeName ? (
            <div className="flex items-center gap-1.5" title={`Assigned to ${task.assigneeName}`}>
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center border border-indigo-200 dark:border-indigo-700">
                {task.assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 hidden group-hover:inline max-w-[80px] truncate">
                {task.assigneeName}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
