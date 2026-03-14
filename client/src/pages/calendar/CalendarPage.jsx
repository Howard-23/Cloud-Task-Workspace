import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

import PageHeader from '../../components/common/PageHeader';
import StatusPill from '../../components/common/StatusPill';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { useTasks } from '../../hooks/useTasks';
import { formatDate } from '../../utils/formatDate';

function getMonthLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function buildCalendarDays(currentMonth, tasks) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const days = [];

  for (let i = 0; i < startWeekday; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const isoDate = date.toISOString().slice(0, 10);
    days.push({
      date,
      isoDate,
      tasks: tasks.filter((task) => task.dueDate?.slice(0, 10) === isoDate),
    });
  }

  return days;
}

export default function CalendarPage() {
  const { tasks, loading, error } = useTasks();
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const datedTasks = tasks.filter((task) => task.dueDate);
  const calendarDays = useMemo(() => buildCalendarDays(monthDate, datedTasks), [datedTasks, monthDate]);

  if (error) {
    return <ErrorState description={error} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Calendar"
        title="Deadline calendar"
        description="Review due dates by month and jump directly into scheduled task work."
        actions={
          <div className="inline-actions">
            <Button
              variant="secondary"
              onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            >
              Next
            </Button>
          </div>
        }
      />

      <Card title={getMonthLabel(monthDate)} description="Tasks are grouped by their due dates.">
        {loading ? (
          <p>Loading calendar…</p>
        ) : datedTasks.length ? (
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="calendar-grid__weekday">
                {day}
              </div>
            ))}

            {calendarDays.map((entry, index) =>
              entry ? (
                <div key={entry.isoDate} className="calendar-day">
                  <div className="calendar-day__header">
                    <strong>{entry.date.getDate()}</strong>
                    <span>{entry.tasks.length ? `${entry.tasks.length} task${entry.tasks.length > 1 ? 's' : ''}` : ''}</span>
                  </div>

                  <div className="calendar-day__stack">
                    {entry.tasks.slice(0, 3).map((task) => (
                      <Link key={task.id} to={`/tasks/${task.id}/edit`} className="calendar-task">
                        <strong>{task.title}</strong>
                        <div className="calendar-task__meta">
                          <StatusPill value={task.status} />
                          <StatusPill value={task.priority} />
                        </div>
                      </Link>
                    ))}
                    {entry.tasks.length > 3 ? <span className="calendar-day__more">+{entry.tasks.length - 3} more</span> : null}
                  </div>
                </div>
              ) : (
                <div key={`blank-${index}`} className="calendar-day calendar-day--empty" />
              ),
            )}
          </div>
        ) : (
          <EmptyState title="No dated tasks" description="Add due dates to tasks to populate the calendar." />
        )}
      </Card>

      <Card title="Upcoming tasks">
        {datedTasks.length ? (
          <div className="deadline-list">
            {datedTasks
              .slice()
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 10)
              .map((task) => (
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
          <EmptyState title="No upcoming tasks" description="Once tasks have due dates, they will appear here." />
        )}
      </Card>
    </div>
  );
}
