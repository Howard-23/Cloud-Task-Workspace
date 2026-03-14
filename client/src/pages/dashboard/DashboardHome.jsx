import { Link } from 'react-router-dom';

import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import StatusPill from '../../components/common/StatusPill';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { formatDate } from '../../utils/formatDate';

function MetricCard({ label, value, detail }) {
  return (
    <Card className="metric-card">
      <p className="metric-card__label">{label}</p>
      <strong className="metric-card__value">{value}</strong>
      <span className="metric-card__detail">{detail}</span>
    </Card>
  );
}

export default function DashboardHome() {
  const { profile } = useAuth();
  const { projects, recentActivity, upcomingDeadlines, loading: projectsLoading, error: projectsError } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();

  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const overdueTasks = tasks.filter((task) => task.dueDate && new Date(task.dueDate).getTime() < Date.now()).length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const assignedToMe = tasks.filter((task) => task.assignedTo === profile?.id && task.status !== 'done').slice(0, 5);
  const dueToday = tasks.filter((task) => task.dueDate?.slice(0, 10) === todayKey).slice(0, 5);
  const recentlyCompletedTasks = tasks
    .filter((task) => task.status === 'done')
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const recentlyUpdatedProjects = projects
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const needsOnboarding = !projects.length && !tasks.length;

  if (projectsError) {
    return <ErrorState description={projectsError} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${profile?.name || 'Operator'}`}
        description="Track workload health, project momentum, and the latest team activity."
        actions={
          <div className="inline-actions">
            <Link to="/projects/new">
              <Button>Create project</Button>
            </Link>
            <Link to="/tasks/new">
              <Button variant="secondary">Create task</Button>
            </Link>
          </div>
        }
      />

      <section className="metrics-grid">
        {projectsLoading || tasksLoading ? (
          <>
            <Skeleton className="skeleton--card" />
            <Skeleton className="skeleton--card" />
            <Skeleton className="skeleton--card" />
            <Skeleton className="skeleton--card" />
          </>
        ) : (
          <>
            <MetricCard label="Total projects" value={projects.length} detail="Active portfolio across the workspace" />
            <MetricCard label="Total tasks" value={tasks.length} detail="All delivery items currently tracked" />
            <MetricCard label="Completed tasks" value={completedTasks} detail="Tasks moved fully into done" />
            <MetricCard label="Overdue tasks" value={overdueTasks} detail="Items that need immediate attention" />
          </>
        )}
      </section>

      {needsOnboarding ? (
        <Card title="Start your workspace" description="Complete the essentials or seed demo data to explore faster.">
          <div className="onboarding-checklist">
            <div className="onboarding-checklist__item">
              <StatusPill value="planning" />
              <span>Create your first project</span>
            </div>
            <div className="onboarding-checklist__item">
              <StatusPill value="planning" />
              <span>Invite a teammate</span>
            </div>
            <div className="onboarding-checklist__item">
              <StatusPill value="planning" />
              <span>Create your first task</span>
            </div>
          </div>
          <div className="inline-actions">
            <Link to="/onboarding">
              <Button>Open onboarding</Button>
            </Link>
            <Link to="/projects/new">
              <Button variant="secondary">Create project</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      <section className="dashboard-grid">
        <Card title="Assigned to me" description="Open work that currently needs your attention.">
          {assignedToMe.length ? (
            <div className="deadline-list">
              {assignedToMe.map((task) => (
                <div key={task.id} className="deadline-list__item">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.projectTitle}</p>
                  </div>
                  <div className="deadline-list__meta">
                    <StatusPill value={task.status} />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing assigned" description="Assigned tasks will appear here automatically." />
          )}
        </Card>

        <Card title="Due today" description="Items that should be completed before the day ends.">
          {dueToday.length ? (
            <div className="deadline-list">
              {dueToday.map((task) => (
                <div key={task.id} className="deadline-list__item">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.projectTitle}</p>
                  </div>
                  <div className="deadline-list__meta">
                    <StatusPill value={task.priority} />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing due today" description="Today’s due work will appear here." />
          )}
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card title="Recent activity" description="Latest events recorded in the workspace">
          {recentActivity.length ? (
            <div className="activity-list">
              {recentActivity.map((item) => (
                <div key={item.id} className="activity-list__item">
                  <div>
                    <strong>{item.userName || 'Workspace'}</strong>
                    <p>{item.message}</p>
                  </div>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No activity yet" description="Create a project or task to start the activity log." />
          )}
        </Card>

        <Card title="Upcoming deadlines" description="Due dates coming up across assigned work">
          {upcomingDeadlines.length ? (
            <div className="deadline-list">
              {upcomingDeadlines.map((task) => (
                <div key={task.id} className="deadline-list__item">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.projectTitle}</p>
                  </div>
                  <div className="deadline-list__meta">
                    <StatusPill value={task.priority} />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No deadlines scheduled" description="Tasks with due dates will appear here automatically." />
          )}
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card title="Recently completed tasks" description="Fresh wins from the latest execution cycle.">
          {recentlyCompletedTasks.length ? (
            <div className="deadline-list">
              {recentlyCompletedTasks.map((task) => (
                <div key={task.id} className="deadline-list__item">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.projectTitle}</p>
                  </div>
                  <div className="deadline-list__meta">
                    <StatusPill value={task.status} />
                    <span>{formatDate(task.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No completed tasks yet" description="Finished work will appear here." />
          )}
        </Card>

        <Card title="Recently updated projects" description="Portfolio items that changed most recently.">
          {recentlyUpdatedProjects.length ? (
            <div className="project-teaser-list">
              {recentlyUpdatedProjects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="project-teaser">
                  <div>
                    <strong>{project.title}</strong>
                    <p>{project.progressPercentage}% complete</p>
                  </div>
                  <div className="project-teaser__meta">
                    <StatusPill value={project.health} />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No updated projects yet" description="Project updates will appear here." />
          )}
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card title="Quick actions" description="Common operations for delivery leads">
          <div className="action-grid">
            <Link to="/projects/new" className="action-card">
              Create a new project
            </Link>
            <Link to="/tasks/new" className="action-card">
              Add a task
            </Link>
            <Link to="/team/invite" className="action-card">
              Invite a member
            </Link>
            <Link to="/settings" className="action-card">
              Update workspace settings
            </Link>
          </div>
        </Card>

        <Card title="Projects in motion" description="Portfolio snapshot">
          {projects.length ? (
            <div className="project-teaser-list">
              {projects.slice(0, 4).map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="project-teaser">
                  <div>
                    <strong>{project.title}</strong>
                    <p>
                      {project.taskCount} tasks
                      {project.dueDate ? ` • Due ${formatDate(project.dueDate)}` : ''}
                    </p>
                  </div>
                  <div className="project-teaser__meta">
                    <StatusPill value={project.health} />
                    <StatusPill value={project.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No projects created"
              description="Create your first project to start assigning tasks and members."
              action={
                <Link to="/projects/new">
                  <Button>Create first project</Button>
                </Link>
              }
            />
          )}
        </Card>
      </section>
    </div>
  );
}
