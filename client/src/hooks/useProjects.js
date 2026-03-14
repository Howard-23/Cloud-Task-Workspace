import { useEffect, useState } from 'react';

import {
  createProject as createProjectRequest,
  deleteProject as deleteProjectRequest,
  getProjectById,
  getProjects,
  updateProject as updateProjectRequest,
} from '../services/projectService';
import { useAuth } from './useAuth';

export function useProjects(initialFilters = {}) {
  const { currentUser, initializing, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh(nextFilters = filters) {
    setLoading(true);
    setError('');

    try {
      const result = await getProjects(nextFilters);
      setProjects(result.projects || []);
      setRecentActivity(result.recentActivity || []);
      setUpcomingDeadlines(result.upcomingDeadlines || []);
      setPagination(result.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      return result;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initializing) {
      return;
    }

    if (!isAuthenticated) {
      setProjects([]);
      setRecentActivity([]);
      setUpcomingDeadlines([]);
      setPagination({ page: 1, limit: 12, total: 0, totalPages: 1 });
      setError('');
      setLoading(false);
      return;
    }

    refresh(filters).catch(() => undefined);
  }, [currentUser?.uid, filters.archived, filters.search, filters.status, initializing, isAuthenticated]);

  async function refreshAfterMutation(nextFilters = filters) {
    try {
      await refresh(nextFilters);
    } catch {
      // Keep the mutation successful even if the list reload fails afterward.
    }
  }

  async function createProject(payload) {
    const project = await createProjectRequest(payload);
    setProjects((current) => [project, ...current.filter((item) => item.id !== project.id)]);
    await refreshAfterMutation(filters);
    return project;
  }

  async function updateProject(payload) {
    const project = await updateProjectRequest(payload);
    setProjects((current) =>
      current.map((item) => (item.id === project.id ? { ...item, ...project } : item)),
    );
    await refreshAfterMutation(filters);
    return project;
  }

  async function removeProject(id) {
    const project = await deleteProjectRequest(id);
    setProjects((current) => current.filter((item) => item.id !== id));
    await refreshAfterMutation(filters);
    return project;
  }

  return {
    projects,
    recentActivity,
    upcomingDeadlines,
    filters,
    setFilters,
    pagination,
    loading,
    error,
    refresh,
    createProject,
    updateProject,
    removeProject,
    getProjectById,
  };
}
