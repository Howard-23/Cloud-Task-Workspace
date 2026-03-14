import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useTeam } from '../../hooks/useTeam';
import { useToast } from '../../hooks/useToast';
import { validateInviteForm } from '../../utils/validators';

export default function InviteMember() {
  const navigate = useNavigate();
  const toast = useToast();
  const { invite } = useTeam();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'member',
    avatarUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateInviteForm(form);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await invite(form);
      toast.success('Member invite recorded.');
      navigate('/team');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Team" title="Invite member" description="Add a collaborator to the workspace directory." />

      <Card>
        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="Full name"
            value={form.name}
            error={errors.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="Email address"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            options={[
              { value: 'viewer', label: 'Viewer' },
              { value: 'member', label: 'Member' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <Input
            label="Avatar URL"
            value={form.avatarUrl}
            onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
            placeholder="Optional"
          />
          <div className="inline-actions">
            <Link to="/team">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Invite member'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
