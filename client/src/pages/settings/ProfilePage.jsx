import { useEffect, useState } from 'react';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validateProfileForm } from '../../utils/validators';

export default function ProfilePage() {
  const { profile, refreshProfile, saveProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    avatarUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshProfile().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile?.email, profile?.name, profile?.avatarUrl]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProfileForm(form);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await saveProfile({
        ...form,
        themePreference: profile?.themePreference || 'light',
        notificationsEnabled: profile?.notificationsEnabled ?? true,
      });
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Profile" title="Update your profile" description="Manage your public workspace identity." />

      <Card>
        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={form.name}
            error={errors.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            hint="This updates Firebase Authentication and your workspace profile."
          />
          <Input
            label="Avatar URL"
            value={form.avatarUrl}
            onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
            placeholder="Optional"
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
