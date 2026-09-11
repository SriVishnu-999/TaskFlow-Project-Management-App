import React, { useState, useEffect, useMemo } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { boardsApi } from '../../api/boardsApi';
import { tasksApi } from '../../api/tasksApi';
import { useProject } from '../../context/ProjectContext';
import { Filter, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';

export function KanbanBoard({ searchQuery, isCreateOpen, onCloseCreate, onOpenCreate, onStatsUpdate, onBoardLoaded }) {
  const { currentProject, teamMembers } = useProject();
  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');

  // Modals state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [quickAddColumn, setQuickAddColumn] = useState(null);

  const fetchBoard = async () => {
    if (!currentProject) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await boardsApi.getProjectDefaultBoard(currentProject.id);
      setBoard(data);
      if (onBoardLoaded) {
        onBoardLoaded(data);
      }
    } catch (err) {
      console.error('Failed to load board:', err);
      setError('Unable to load board. Please make sure the backend API is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [currentProject?.id]);

  // Compute stats for sidebar whenever board changes
  useEffect(() => {
    if (!board) return;
    const allTasks = board.columns.flatMap(c => c.tasks);
    const total = allTasks.length;
    const done = allTasks.filter(t => t.status === 'Done').length;
    const inProgress = allTasks.filter(t => t.status === 'InProgress').length;
    const urgent = allTasks.filter(t => t.priority === 'Urgent').length;
    const completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0;

    if (onStatsUpdate) {
      onStatsUpdate({ total, done, inProgress, urgent, completionPercentage });
    }
  }, [board, onStatsUpdate]);

  // Handle Drag-and-Drop Task Movement with Optimistic UI
  const handleMoveTask = async (taskId, targetColumnId, targetStatus) => {
    if (!board) return;

    let sourceCol = null;
    let movedTask = null;

    for (const col of board.columns) {
      const found = col.tasks.find(t => t.id === taskId);
      if (found) {
        sourceCol = col;
        movedTask = found;
        break;
      }
    }

    if (!movedTask || sourceCol.id === targetColumnId) {
      return;
    }

    const previousBoard = { ...board };
    const updatedColumns = board.columns.map(col => {
      if (col.id === sourceCol.id) {
        return {
          ...col,
          tasks: col.tasks.filter(t => t.id !== taskId)
        };
      }
      if (col.id === targetColumnId) {
        const updatedTask = {
          ...movedTask,
          boardColumnId: targetColumnId,
          status: targetStatus,
          orderIndex: col.tasks.length
        };
        return {
          ...col,
          tasks: [...col.tasks, updatedTask]
        };
      }
      return col;
    });

    setBoard({ ...board, columns: updatedColumns });

    try {
      await tasksApi.moveTask(taskId, {
        targetColumnId,
        newOrderIndex: 0,
        newStatus: targetStatus
      });
    } catch (err) {
      console.error('Failed to move task on server:', err);
      setBoard(previousBoard);
    }
  };

  const handleCreateTask = async (taskData) => {
    const newTask = await tasksApi.createTask(taskData);
    await fetchBoard();
    return newTask;
  };

  const handleUpdateTask = async (taskId, updateData) => {
    const updated = await tasksApi.updateTask(taskId, updateData);
    await fetchBoard();
    return updated;
  };

  const handleDeleteTask = async (taskId) => {
    await tasksApi.deleteTask(taskId);
    await fetchBoard();
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleQuickAdd = (columnId, statusMapping) => {
    setQuickAddColumn({ columnId, statusMapping });
    onOpenCreate();
  };

  const filteredColumns = useMemo(() => {
    if (!board) return [];

    return board.columns.map(col => {
      const filteredTasks = col.tasks.filter(task => {
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchKey = task.taskKey.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchKey && !matchDesc) return false;
        }

        if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
          return false;
        }

        if (assigneeFilter !== 'All' && task.assigneeId !== assigneeFilter) {
          return false;
        }

        return true;
      });

      return {
        ...col,
        tasks: filteredTasks
      };
    });
  }, [board, searchQuery, priorityFilter, assigneeFilter]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading Kanban board...</p>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-md bg-white dark:bg-slate-800 p-6 rounded-2xl border border-red-200 dark:border-red-900/50 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Failed to load board</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'No board available for this project.'}</p>
          <button
            type="button"
            onClick={fetchBoard}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
      {/* Board Top Header: Title, Description, and Filters Bar */}
      <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {board.name}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Active Sprint
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {board.description || 'Drag and drop cards across columns to update task progress'}
          </p>
        </div>

        {/* Filters Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="All" className="dark:bg-slate-800">All Priorities</option>
              <option value="Urgent" className="dark:bg-slate-800">Urgent 🔥</option>
              <option value="High" className="dark:bg-slate-800">High</option>
              <option value="Medium" className="dark:bg-slate-800">Medium</option>
              <option value="Low" className="dark:bg-slate-800">Low</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs shadow-2xs">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="All" className="dark:bg-slate-800">Everyone</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id} className="dark:bg-slate-800">{m.fullName}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchBoard}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-5 items-start">
        {filteredColumns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={col.tasks}
            onSelectTask={handleSelectTask}
            onMoveTask={handleMoveTask}
            onDeleteTask={handleDeleteTask}
            onQuickAddTask={handleQuickAdd}
            allColumns={board.columns}
          />
        ))}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => {
          setQuickAddColumn(null);
          onCloseCreate();
        }}
        onSubmit={handleCreateTask}
        columns={board.columns}
        initialColumnId={quickAddColumn?.columnId}
        initialStatus={quickAddColumn?.statusMapping}
      />

      {/* Task Detail / Edit Modal */}
      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setSelectedTask(null);
          setIsDetailOpen(false);
        }}
        task={selectedTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        columns={board.columns}
      />
    </div>
  );
}
