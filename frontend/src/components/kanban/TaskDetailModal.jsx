import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useProject } from '../../context/ProjectContext';
import { tasksApi } from '../../api/tasksApi';
import { 
  Trash2, 
  History, 
  Clock
} from 'lucide-react';

export function TaskDetailModal({ 
  isOpen, 
  onClose, 
  task, 
  onUpdateTask, 
  onDeleteTask, 
  columns = [] 
}) {
  const { teamMembers } = useProject();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [boardColumnId, setBoardColumnId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [storyPoints, setStoryPoints] = useState(1);
  const [tagsString, setTagsString] = useState('');
  const [activities, setActivities] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'activities'

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
      setStatus(task.status || 'Todo');
      setBoardColumnId(task.boardColumnId || '');
      setAssigneeId(task.assigneeId || '');
      setStoryPoints(task.storyPoints || 1);
      setTagsString(task.tags ? task.tags.join(', ') : '');
      setError(null);

      if (task.dueDate) {
        setDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }

      tasksApi.getActivities(task.id)
        .then(setActivities)
        .catch(err => console.error('Failed to load activities:', err));
    }
  }, [task]);

  if (!task) return null;

  const handleColumnChange = (e) => {
    const colId = e.target.value;
    setBoardColumnId(colId);
    const col = columns.find(c => c.id === colId);
    if (col) {
      setStatus(col.statusMapping);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const tags = tagsString
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await onUpdateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        boardColumnId: boardColumnId || task.boardColumnId,
        assigneeId: assigneeId ? assigneeId : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        storyPoints: Number(storyPoints) || 1,
        tags
      });
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
      const msg = err.response?.data?.message || 'Failed to save changes. Please try again.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
            {task.taskKey}
          </span>
          <span className="truncate max-w-sm text-slate-900 dark:text-slate-100">{task.title}</span>
        </div>
      }
      subtitle={`Created on ${new Date(task.createdAt).toLocaleDateString()} by ${task.reporterName || 'Alex Morgan'}`}
      maxWidth="max-w-3xl"
    >
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-3 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`text-sm font-semibold pb-1 -mb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'details'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Task Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`text-sm font-semibold pb-1 -mb-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'activities'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Activity Audit ({activities.length})</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      {activeTab === 'details' ? (
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-semibold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-hidden transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="No description provided yet..."
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-hidden resize-none transition-all"
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Board Column
              </label>
              <select
                value={boardColumnId}
                onChange={handleColumnChange}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 font-medium text-slate-800 dark:text-slate-100 outline-hidden cursor-pointer"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.statusMapping})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-755 font-medium text-slate-800 dark:text-slate-100 outline-hidden cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent 🔥</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-800 dark:text-slate-100 outline-hidden cursor-pointer"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Story Points
              </label>
              <input
                type="number"
                min="1"
                max="21"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-800 dark:text-slate-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-800 dark:text-slate-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="Architecture, API"
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-800 dark:text-slate-100 outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-750">
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete this task?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Task</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !title.trim()}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs shadow-indigo-200 dark:shadow-none transition-colors cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Activity Audit Trail */
        <div className="space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Chronological audit log of all transitions, updates, and assignments:
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="relative text-xs">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-950" />
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{act.action} by {act.userName}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">{act.description}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500 italic">No recorded activity history yet.</div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
