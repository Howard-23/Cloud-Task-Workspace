import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import { useTeam } from '../../hooks/useTeam';
import { useToast } from '../../hooks/useToast';
import { getProjectById } from '../../services/projectService';
import { validateProjectForm } from '../../utils/validators';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser, initializing, isAuthenticated, profile } = useAuth();
  const { updateProject } = useProjects();
  const { members, loading: teamLoading, error: teamError } = useTeam();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id,
    title: '',
    description: '',
    startDate: '',
    status: 'active',
    priority: 'medium',
    dueDate: '',
    archived: false,
    memberAssignments: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initializing || !isAuthenticated) {
      return;
    }

    async function loadProject() {
      setLoading(true);

      try {
        const result = await getProjectById(id);
        setForm({
          id,
          title: result.project.title,
          description: result.project.description || '',
          startDate: result.project.startDate ? result.project.startDate.slice(0, 10) : '',
          status: result.project.status,
          priority: result.project.priority || 'medium',
          dueDate: result.project.dueDate ? result.project.dueDate.slice(0, 10) : '',
          archived: result.project.archived ?? false,
          memberAssignments: (result.members || [])
            .filter((member) => member.role !== 'owner')
            .map((member) => ({ userId: member.userId, role: member.role })),
        });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [currentUser?.uid, id, initializing, isAuthenticated, toast]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProjectForm(form);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await updateProject(form);
      toast.success('Project updated.');
      navigate(`/projects/${id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMember(memberId) {
    setForm((current) => ({
      ...current,
      memberAssignments: current.memberAssignments.some((assignment) => assignment.userId === memberId)
        ? current.memberAssignments.filter((assignment) => assignment.userId !== memberId)
        : [...current.memberAssignments, { userId: memberId, role: 'member' }],
    }));
  }

  function changeMemberRole(memberId, role) {
    setForm((current) => ({
      ...current,
      memberAssignments: current.memberAssignments.map((assignment) =>
        assignment.userId === memberId ? { ...assignment, role } : assignment,
      ),
    }));
  }

  const assignableMembers = members.filter((member) => member.id !== profile?.id);

  if (loading) {
    return <Card title="Loading project">Preparing edit form...</Card>;
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Projects" title="Edit project" description="Update project scope and ownership." />

      <Card>
        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="Project title"
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
            <Input
              label="Project start date"
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
            />
            <Input
              label="Project due date"
              type="date"
              value={form.dueDate}
              error={errors.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            />
          </div>
          <div className="form-grid">
            <Select
              label="Project priority"
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
            <Select
              label="Archive state"
              value={form.archived ? 'true' : 'false'}
              onChange={(event) =>
                setForm((current) => ({ ...current, archived: event.target.value === 'true' }))
              }
              options={[
                { value: 'false', label: 'Active portfolio' },
                { value: 'true', label: 'Archived' },
              ]}
            />
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            options={[
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'on_hold', label: 'On hold' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          <div className="field">
            <span className="field__label">Assigned members</span>
            <span className="field__hint">You stay attached to the project as the owner.</span>
            {teamLoading ? <div className="field-panel">Loading team members...</div> : null}
            {!teamLoading && teamError ? (
              <div className="field-panel">
                <p>{teamError}</p>
                <Link to="/team/invite">
                  <Button size="sm" variant="secondary">
                    Invite a member first
                  </Button>
                </Link>
              </div>
            ) : null}
            {!teamLoading && !teamError && !assignableMembers.length ? (
              <div className="field-panel">
                <p>No additional members are available yet.</p>
                <Link to="/team/invite">
                  <Button size="sm" variant="secondary">
                    Add team members
                  </Button>
                </Link>
              </div>
            ) : null}
            {!teamLoading && !teamError && assignableMembers.length ? (
              <div className="selection-grid">
                {assignableMembers.map((member) => (
                  <div key={member.id} className="member-assignment">
                    <label className="checkbox-chip">
                      <input
                        type="checkbox"
                        checked={form.memberAssignments.some((assignment) => assignment.userId === member.id)}
                        onChange={() => toggleMember(member.id)}
                      />
                      <span>{member.name}</span>
                    </label>
                    {form.memberAssignments.some((assignment) => assignment.userId === member.id) ? (
                      <Select
                        className="member-assignment__role"
                        value={
                          form.memberAssignments.find((assignment) => assignment.userId === member.id)?.role || 'member'
                        }
                        onChange={(event) => changeMemberRole(member.id, event.target.value)}
                        options={[
                          { value: 'viewer', label: 'Viewer' },
                          { value: 'member', label: 'Member' },
                          { value: 'admin', label: 'Admin' },
                        ]}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="inline-actions">
            <Link to={`/projects/${id}`}>
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
