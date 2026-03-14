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
import Tabs from '../../components/ui/Tabs';
import { useProjects } from '../../hooks/useProjects';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatDate';

export default function ProjectsList() {
  const { projects, filters, setFilters, pagination, loading, error, removeProject } = useProjects({
    search: '',
    status: '',
    archived: false,
    sort: 'updated_desc',
    page: 1,
    limit: 9,
  });
  const toast = useToast();
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleDeleteProject() {
    if (!projectToDelete) return;

    setBusy(true);

    try {
      await removeProject(projectToDelete.id);
      toast.success('Project removed from the portfolio.');
      setProjectToDelete(null);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return <ErrorState description={error} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Projects"
        title="Manage delivery portfolios"
        description="Create, organize, and monitor active client or product initiatives."
        actions={
          <Link to="/projects/new">
            <Button>Create project</Button>
          </Link>
        }
      />

      <Card>
        <div className="toolbar toolbar--stack">
          <Tabs
            value={typeof filters.archived === 'boolean' ? String(filters.archived) : 'all'}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                archived: value === 'all' ? undefined : value === 'true',
                page: 1,
              }))
            }
            tabs={[
              { value: 'false', label: 'Active' },
              { value: 'true', label: 'Archived' },
              { value: 'all', label: 'All' },
            ]}
          />
          <SearchBar
            value={filters.search || ''}
            onChange={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
            placeholder="Search projects"
          />
          <select
            className="select select--compact"
            value={filters.status || ''}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
          >
            <option value="">All statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On hold</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="select select--compact"
            value={filters.sort || 'updated_desc'}
            onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value, page: 1 }))}
          >
            <option value="updated_desc">Recently updated</option>
            <option value="due_asc">Nearest deadline</option>
            <option value="progress_desc">Most progress</option>
            <option value="title_asc">Title A-Z</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <Card title="Loading projects">
          <p>Syncing your project portfolio...</p>
        </Card>
      ) : projects.length ? (
        <section className="project-grid">
          {projects.map((project) => (
            <Card
              key={project.id}
              title={project.title}
              description={project.description || 'No description provided yet.'}
              action={
                <div className="project-card__action">
                  <StatusPill value={project.status} />
                  <StatusPill value={project.health} />
                </div>
              }
            >
              <div className="project-progress">
                <div className="project-progress__meta">
                  <strong>{project.progressPercentage}% complete</strong>
                  <span>{project.priority} priority</span>
                </div>
                <div className="project-progress__track">
                  <span className="project-progress__fill" style={{ width: `${project.progressPercentage}%` }} />
                </div>
              </div>
              <div className="project-card__stats">
                <span>{project.taskCount} tasks</span>
                <span>{project.completedTaskCount} completed</span>
                <span>Starts {formatDate(project.startDate)}</span>
                <span>Due {formatDate(project.dueDate)}</span>
              </div>
              <div className="inline-actions">
                <Link to={`/projects/${project.id}`}>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </Link>
                <Link to={`/projects/${project.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setProjectToDelete(project)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No projects found"
          description="Create a project to start organizing tasks, members, and delivery status."
          action={
            <Link to="/projects/new">
              <Button>Create project</Button>
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
        open={Boolean(projectToDelete)}
        title="Delete this project?"
        description="This project will be removed from active views without permanently erasing its audit history."
        confirmLabel="Delete project"
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
        busy={busy}
      />
    </div>
  );
}
