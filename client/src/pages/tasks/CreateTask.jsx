import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useTeam } from '../../hooks/useTeam';
import { useToast } from '../../hooks/useToast';
import { validateTaskForm } from '../../utils/validators';

export default function CreateTask() {
  const navigate = useNavigate();
  const toast = useToast();
  const { projects } = useProjects();
  const { members } = useTeam();
  const { createTask } = useTasks();
  const [form, setForm] = useState({
    projectId: '',
    assignedTo: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const selectedProject = projects.find((project) => project.id === form.projectId);

  useEffect(() => {
    if (!projects.length) {
      return;
    }

    setForm((current) => {
      const hasSelectedProject = projects.some((project) => project.id === current.projectId);

      if (hasSelectedProject) {
        return current;
      }

      return {
        ...current,
        projectId: projects[0].id,
      };
    });
  }, [projects]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateTaskForm(form);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await createTask(form);
      toast.success('Task created.');
      navigate('/tasks');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Tasks" title="Create task" description="Add a new work item to an active project." />

      <Card>
        <form className="form-stack" onSubmit={handleSubmit}>
          <Select
            label="Project"
            value={form.projectId}
            error={errors.projectId}
            onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
            options={projects.map((project) => ({ value: project.id, label: project.title }))}
            placeholder={projects.length ? undefined : 'Create a project first'}
            hint={
              selectedProject?.dueDate
                ? `Project due date: ${selectedProject.dueDate.slice(0, 10)}`
                : 'Set a project due date to keep assignees aligned.'
            }
          />
          <Input
            label="Task title"
            value={form.title}
            error={errors.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <div className="form-grid">
            <Select
              label="Priority"
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              options={[
                { value: 'todo', label: 'To do' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'done', label: 'Done' },
              ]}
            />
          </div>
          <div className="form-grid">
            <Select
              label="Assignee"
              value={form.assignedTo}
              onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}
              options={members.map((member) => ({ value: member.id, label: member.name }))}
              placeholder="Unassigned"
            />
            <Input
              label="Due date"
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            />
          </div>
          <div className="inline-actions">
            <Link to="/tasks">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create task'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
