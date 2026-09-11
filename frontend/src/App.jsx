import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/views/ProjectsView';
import { TeamView } from './components/views/TeamView';
import { AuthPage } from './components/auth/AuthPage';
import { CreateTaskModal } from './components/kanban/CreateTaskModal';
import { tasksApi } from './api/tasksApi';

function MainWorkspace() {
  const { currentProject } = useProject();
  const [currentView, setCurrentView] = useState('board'); // 'board' | 'analytics' | 'projects' | 'team'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [boardColumns, setBoardColumns] = useState([]);
  const [taskStats, setTaskStats] = useState({ total: 0, done: 0, inProgress: 0, urgent: 0, completionPercentage: 0 });
  const [boardRefreshTrigger, setBoardRefreshTrigger] = useState(0);

  const handleCreateTask = async (taskData) => {
    const newTask = await tasksApi.createTask(taskData);
    setBoardRefreshTrigger(prev => prev + 1);
    return newTask;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenNewTask={() => setIsCreateTaskOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Workspace Body: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          taskStats={taskStats}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'board' && (
            <KanbanBoard
              key={boardRefreshTrigger}
              searchQuery={searchQuery}
              isCreateOpen={isCreateTaskOpen}
              onCloseCreate={() => setIsCreateTaskOpen(false)}
              onOpenCreate={() => setIsCreateTaskOpen(true)}
              onStatsUpdate={setTaskStats}
              onBoardLoaded={(board) => {
                if (board?.columns) {
                  setBoardColumns(board.columns);
                }
              }}
            />
          )}

          {currentView === 'analytics' && <DashboardView />}
          {currentView === 'projects' && (
            <ProjectsView onSelectProjectView={(view) => setCurrentView(view)} />
          )}
          {currentView === 'team' && <TeamView />}
        </main>
      </div>

      {/* Global Create Task Modal (callable from Navbar even when not on Kanban board) */}
      {currentView !== 'board' && (
        <CreateTaskModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onSubmit={handleCreateTask}
          columns={boardColumns}
        />
      )}
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <ProjectProvider>
      <MainWorkspace />
    </ProjectProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
