import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectsApi } from '../api/projectsApi';
import { authApi } from '../api/authApi';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [projList, usersList] = await Promise.all([
        projectsApi.getProjects(),
        authApi.getUsers()
      ]);
      setProjects(projList);
      setTeamMembers(usersList);

      if (projList.length > 0) {
        const savedProjId = localStorage.getItem('taskflow_active_project_id');
        const matched = projList.find(p => p.id === savedProjId);
        setCurrentProject(matched || projList[0]);
      } else {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error('Failed to load projects/team:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setTeamMembers([]);
    }
  }, [isAuthenticated]);

  const selectProject = (project) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem('taskflow_active_project_id', project.id);
    } else {
      localStorage.removeItem('taskflow_active_project_id');
    }
  };

  const createProject = async (data) => {
    const newProj = await projectsApi.createProject(data);
    await fetchProjects();
    selectProject(newProj);
    return newProj;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        teamMembers,
        isLoading,
        selectProject,
        createProject,
        refreshProjects: fetchProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
