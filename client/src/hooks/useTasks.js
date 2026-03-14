import { useEffect, useState } from 'react';

import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  getTaskById,
  getTasks,
  updateTask as updateTaskRequest,
} from '../services/taskService';
import { useAuth } from './useAuth';

export function useTasks(initialFilters = {}) {
  const { currentUser, initializing, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh(nextFilters = filters) {
    setLoading(true);
    setError('');

    try {
      const result = await getTasks(nextFilters);
      setTasks(result.tasks || []);
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
      setTasks([]);
      setPagination({ page: 1, limit: 12, total: 0, totalPages: 1 });
      setError('');
      setLoading(false);
      return;
    }

    refresh(filters).catch(() => undefined);
  }, [currentUser?.uid, filters.projectId, filters.priority, filters.search, filters.status, initializing, isAuthenticated]);

  async function refreshAfterMutation(nextFilters = filters) {
    try {
      await refresh(nextFilters);
    } catch {
      // Keep the mutation successful even if the list reload fails afterward.
    }
  }

  async function createTask(payload) {
    const task = await createTaskRequest(payload);
    setTasks((current) => [task, ...current.filter((item) => item.id !== task.id)]);
    await refreshAfterMutation(filters);
    return task;
  }

  async function updateTask(payload) {
    const task = await updateTaskRequest(payload);
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, ...task } : item)));
    await refreshAfterMutation(filters);
    return task;
  }

  async function removeTask(id) {
    const task = await deleteTaskRequest(id);
    setTasks((current) => current.filter((item) => item.id !== id));
    await refreshAfterMutation(filters);
    return task;
  }

  return {
    tasks,
    filters,
    setFilters,
    pagination,
    loading,
    error,
    refresh,
    createTask,
    updateTask,
    removeTask,
    getTaskById,
  };
}
