import { Link } from 'react-router-dom';
import { useState } from 'react';

import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import StatusPill from '../../components/common/StatusPill';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Pagination from '../../components/ui/Pagination';
import Table from '../../components/ui/Table';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatDate';

export default function TasksList() {
  const { projects } = useProjects();
  const { tasks, filters, setFilters, pagination, loading, error, removeTask, updateTask } = useTasks({
    search: '',
    projectId: '',
    status: '',
    priority: '',
    sort: 'status_default',
    page: 1,
    limit: 10,
  });
  const toast = useToast();
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [statusSavingId, setStatusSavingId] = useState('');

  async function handleDeleteTask() {
    if (!taskToDelete) return;

    try {
      await removeTask(taskToDelete.id);
      toast.success('Task deleted.');
      setTaskToDelete(null);
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  async function handleStatusChange(task, nextStatus) {
    if (!nextStatus || nextStatus === task.status) {
      return;
    }

    setStatusSavingId(task.id);

    try {
      await updateTask({
        id: task.id,
        status: nextStatus,
      });
      toast.success('Task status updated.');
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setStatusSavingId('');
    }
  }

  if (error) {
    return <ErrorState description={error} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Tasks"
        title="Task list"
        description="View and filter all work items across the workspace."
        actions={
          <div className="inline-actions">
            <Link to="/tasks/board">
              <Button variant="secondary">Board view</Button>
            </Link>
            <Link to="/tasks/new">
              <Button>Create task</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <div className="toolbar toolbar--grid">
          <SearchBar
            value={filters.search || ''}
            onChange={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
            placeholder="Search tasks"
          />
          <select
            className="select select--compact"
            value={filters.projectId || ''}
            onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value, page: 1 }))}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <select
            className="select select--compact"
            value={filters.status || ''}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
          >
            <option value="">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <select
            className="select select--compact"
            value={filters.priority || ''}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value, page: 1 }))}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            className="select select--compact"
            value={filters.sort || 'status_default'}
            onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value, page: 1 }))}
          >
            <option value="status_default">Default workflow</option>
            <option value="due_asc">Nearest deadline</option>
            <option value="updated_desc">Recently updated</option>
            <option value="priority_desc">Highest priority</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <Card title="Loading tasks">Preparing task table...</Card>
      ) : tasks.length ? (
        <Card>
          <Table
            columns={[
              { key: 'title', label: 'Task' },
              { key: 'projectTitle', label: 'Project' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => (
                  <select
                    className="select select--compact"
                    value={row.status}
                    disabled={statusSavingId === row.id}
                    onChange={(event) => handleStatusChange(row, event.target.value)}
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                ),
              },
              { key: 'priority', label: 'Priority', render: (row) => <StatusPill value={row.priority} /> },
              { key: 'dueDate', label: 'Due date', render: (row) => formatDate(row.dueDate) },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="inline-actions">
                    <Link to={`/tasks/${row.id}/edit`}>
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    </Link>
                    <Button size="sm" variant="danger" onClick={() => setTaskToDelete(row)}>
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={tasks}
          />
        </Card>
      ) : (
        <EmptyState
          title="No tasks found"
          description="Create a task or adjust filters to see more results."
          action={
            <Link to="/tasks/new">
              <Button>Create task</Button>
            </Link>
          }
        />
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      />

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        description="This task will be removed from active views without permanently erasing its audit history."
        confirmLabel="Delete task"
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}
