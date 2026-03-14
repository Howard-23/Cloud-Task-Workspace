import { Link } from 'react-router-dom';

import PageHeader from '../../components/common/PageHeader';
import StatusPill from '../../components/common/StatusPill';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { useTasks } from '../../hooks/useTasks';
import { formatDate } from '../../utils/formatDate';

const boardColumns = [
  { key: 'todo', title: 'To do' },
  { key: 'in_progress', title: 'In progress' },
  { key: 'done', title: 'Done' },
];

export default function TaskBoard() {
  const { tasks, loading, error } = useTasks();

  if (error) {
    return <ErrorState description={error} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Tasks"
        title="Kanban board"
        description="Review workflow state from backlog to completion."
        actions={
          <div className="inline-actions">
            <Link to="/tasks">
              <Button variant="secondary">Table view</Button>
            </Link>
            <Link to="/tasks/new">
              <Button>Create task</Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <Card title="Loading board">Building task columns...</Card>
      ) : tasks.length ? (
        <section className="board-grid">
          {boardColumns.map((column) => (
            <Card key={column.key} title={column.title} className="board-column">
              <div className="board-column__stack">
                {tasks.filter((task) => task.status === column.key).map((task) => (
                  <Link key={task.id} to={`/tasks/${task.id}/edit`} className="board-task">
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.projectTitle}</p>
                    </div>
                    <div className="board-task__meta">
                      <StatusPill value={task.priority} />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState title="No tasks yet" description="Create a task to start populating the board." />
      )}
    </div>
  );
}
