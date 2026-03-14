import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getFirebaseAuthMessage, shouldIgnoreFirebaseAuthError } from '../../utils/authErrors';

export default function Register() {
  const navigate = useNavigate();
  const { loginWithGoogle, register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await register(form);
      toast.success('Your workspace account has been created.');
      navigate('/onboarding', { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleRegister() {
    setSubmitting(true);

    try {
      await loginWithGoogle();
      toast.success('Signed in with Google.');
      navigate('/onboarding', { replace: true });
    } catch (error) {
      if (!shouldIgnoreFirebaseAuthError(error)) {
        toast.error(getFirebaseAuthMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <Card title="Create your workspace account" description="Start managing projects with CloudTask Pro.">
        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleGoogleRegister} disabled={submitting}>
            Continue with Google
          </Button>
        </form>
        <div className="auth-links">
          <span>
            Already have an account? <Link to="/login">Sign in</Link>
          </span>
        </div>
      </Card>
    </div>
  );
}
