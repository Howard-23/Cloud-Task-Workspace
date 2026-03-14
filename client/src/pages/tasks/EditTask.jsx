import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import PageHeader from '../../components/common/PageHeader';
import CommentThread from '../../components/common/CommentThread';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useTeam } from '../../hooks/useTeam';
import { useToast } from '../../hooks/useToast';
import { getTaskById } from '../../services/taskService';
import { validateTaskForm } from '../../utils/validators';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser, initializing, isAuthenticated } = useAuth();
  const { projects } = useProjects();
  const { members } = useTeam();
  const { updateTask } = useTasks();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id,
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
    if (initializing || !isAuthenticated) {
      return;
    }

    async function loadTask() {
      setLoading(true);

      try {
        const result = await getTaskById(id);
        setForm({
          id,
          projectId: result.task.projectId,
          assignedTo: result.task.assignedTo || '',
          title: result.task.title,
          description: result.task.description || '',
          priority: result.task.priority,
          status: result.task.status,
          dueDate: result.task.dueDate ? result.task.dueDate.slice(0, 10) : '',
        });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [currentUser?.uid, id, initializing, isAuthenticated, toast]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateTaskForm(form);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await updateTask(form);
      toast.success('Task updated.');
      navigate('/tasks');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Card title="Loading task">Preparing task details...</Card>;
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Tasks" title="Edit task" description="Refine scope, status, or assignment details." />

      <Card>
        <form className="form-stack" onSubmit={handleSubmit}>
          <Select
            label="Project"
            value={form.projectId}
            error={errors.projectId}
            onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
            options={projects.map((project) => ({ value: project.id, label: project.title }))}
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
              {submitting ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>

      <CommentThread entityType="task" entityId={id} title="Task discussion" />
    </div>
  );
}
