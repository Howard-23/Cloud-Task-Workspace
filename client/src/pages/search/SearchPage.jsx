import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import StatusPill from '../../components/common/StatusPill';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useTeam } from '../../hooks/useTeam';
import { formatDate } from '../../utils/formatDate';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const normalizedQuery = query.trim().toLowerCase();
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    setFilters: setProjectFilters,
  } = useProjects({ search: query, status: '', archived: false });
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    setFilters: setTaskFilters,
  } = useTasks({ search: query, projectId: '', priority: '', status: '' });
  const { members, loading: teamLoading, error: teamError } = useTeam();

  useEffect(() => {
    setProjectFilters((current) => ({ ...current, search: query }));
    setTaskFilters((current) => ({ ...current, search: query }));
  }, [query, setProjectFilters, setTaskFilters]);

  const memberResults = members.filter((member) => {
    if (!normalizedQuery) return false;
    return [member.name, member.email, member.role].some((value) => value?.toLowerCase().includes(normalizedQuery));
  });

  if (projectsError || tasksError || teamError) {
    return <ErrorState description={projectsError || tasksError || teamError} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Search"
        title={query ? `Results for "${query}"` : 'Global search'}
        description="Search across projects, tasks, and workspace members from one place."
      />

      {!query ? (
        <EmptyState title="Start searching" description="Use the topbar search to find projects, tasks, and people." />
      ) : (
        <>
          <section className="dashboard-grid">
            <Card title="Projects">
              {projectsLoading ? (
                <p>Searching projects...</p>
              ) : projects.length ? (
                <div className="stack-list">
                  {projects.map((project) => (
                    <Link key={project.id} to={`/projects/${project.id}`} className="project-teaser">
                      <div>
                        <strong>{project.title}</strong>
                        <p>{project.description || 'No description provided.'}</p>
                      </div>
                      <div className="project-teaser__meta">
                        <StatusPill value={project.status} />
                        <StatusPill value={project.health} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState title="No project matches" description="Try a different search term." />
              )}
            </Card>

            <Card title="Tasks">
              {tasksLoading ? (
                <p>Searching tasks...</p>
              ) : tasks.length ? (
                <div className="stack-list">
                  {tasks.map((task) => (
                    <Link key={task.id} to={`/tasks/${task.id}/edit`} className="project-teaser">
                      <div>
                        <strong>{task.title}</strong>
                        <p>
                          {task.projectTitle}
                          {task.dueDate ? ` • Due ${formatDate(task.dueDate)}` : ''}
                        </p>
                      </div>
                      <div className="project-teaser__meta">
                        <StatusPill value={task.status} />
                        <StatusPill value={task.priority} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState title="No task matches" description="Try a different search term." />
              )}
            </Card>
          </section>

          <Card title="Members">
            {teamLoading ? (
              <p>Searching members...</p>
            ) : memberResults.length ? (
              <div className="stack-list">
                {memberResults.map((member) => (
                  <div key={member.id} className="member-row">
                    <div>
                      <strong>{member.name}</strong>
                      <p>{member.email}</p>
                    </div>
                    <StatusPill value={member.role} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No member matches" description="Try a different search term." />
            )}
          </Card>

          <div className="inline-actions">
            <Link to="/projects">
              <Button variant="secondary">Open projects</Button>
            </Link>
            <Link to="/tasks">
              <Button variant="secondary">Open tasks</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
