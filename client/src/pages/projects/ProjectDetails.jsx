import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import PageHeader from '../../components/common/PageHeader';
import CommentThread from '../../components/common/CommentThread';
import StatusPill from '../../components/common/StatusPill';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Table from '../../components/ui/Table';
import { useAuth } from '../../hooks/useAuth';
import { getProjectById } from '../../services/projectService';
import { formatDate } from '../../utils/formatDate';

export default function ProjectDetails() {
  const { id } = useParams();
  const { currentUser, initializing, isAuthenticated } = useAuth();
  const [state, setState] = useState({
    loading: true,
    error: '',
    project: null,
    members: [],
    tasks: [],
    activity: [],
  });

  useEffect(() => {
    if (initializing || !isAuthenticated) {
      return;
    }

    async function loadProject() {
      setState((current) => ({ ...current, loading: true, error: '' }));

      try {
        const result = await getProjectById(id);
        setState({
          loading: false,
          error: '',
          project: result.project,
          members: result.members || [],
          tasks: result.tasks || [],
          activity: result.activity || [],
        });
      } catch (error) {
        setState((current) => ({ ...current, loading: false, error: error.message }));
      }
    }

    loadProject();
  }, [currentUser?.uid, id, initializing, isAuthenticated]);

  if (state.loading) {
    return <Card title="Loading project">Gathering project details...</Card>;
  }

  if (state.error) {
    return <ErrorState description={state.error} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Project detail"
        title={state.project.title}
        description={state.project.description || 'This project has no description yet.'}
        actions={
          <div className="inline-actions">
            <StatusPill value={state.project.health} />
            <StatusPill value={state.project.priority} />
            <StatusPill value={state.project.status} />
            <Link to={`/projects/${id}/edit`}>
              <Button>Edit project</Button>
            </Link>
          </div>
        }
      />

      <section className="dashboard-grid">
        <Card title="Project summary">
          <div className="project-progress">
            <div className="project-progress__meta">
              <strong>{state.project.progressPercentage}% complete</strong>
              <span>{state.project.health.replace('_', ' ')}</span>
            </div>
            <div className="project-progress__track">
              <span className="project-progress__fill" style={{ width: `${state.project.progressPercentage}%` }} />
            </div>
          </div>
          <div className="summary-grid">
            <div>
              <span className="summary-label">Tasks</span>
              <strong>{state.project.taskCount}</strong>
            </div>
            <div>
              <span className="summary-label">Completed</span>
              <strong>{state.project.completedTaskCount}</strong>
            </div>
            <div>
              <span className="summary-label">Created</span>
              <strong>{formatDate(state.project.createdAt)}</strong>
            </div>
            <div>
              <span className="summary-label">Started</span>
              <strong>{formatDate(state.project.startDate)}</strong>
            </div>
            <div>
              <span className="summary-label">Project due</span>
              <strong>{formatDate(state.project.dueDate)}</strong>
            </div>
            <div>
              <span className="summary-label">Priority</span>
              <strong>{state.project.priority}</strong>
            </div>
          </div>
        </Card>

        <Card title="Assigned members">
          {state.members.length ? (
            <div className="stack-list">
              {state.members.map((member) => (
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
            <EmptyState title="No members assigned" description="Add members when editing the project." />
          )}
        </Card>
      </section>

      <Card title="Project tasks">
        <Table
          columns={[
            { key: 'title', label: 'Task' },
            { key: 'status', label: 'Status', render: (row) => <StatusPill value={row.status} /> },
            { key: 'priority', label: 'Priority', render: (row) => <StatusPill value={row.priority} /> },
            { key: 'dueDate', label: 'Due date', render: (row) => formatDate(row.dueDate) },
          ]}
          rows={state.tasks}
          emptyMessage="No tasks in this project yet."
        />
      </Card>

      <Card title="Recent activity">
        {state.activity.length ? (
          <div className="activity-list">
            {state.activity.map((item) => (
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
          <EmptyState title="No project activity" description="Project changes will appear here." />
        )}
      </Card>

      <CommentThread entityType="project" entityId={id} title="Project discussion" />
    </div>
  );
}
