import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getFirebaseAuthMessage, shouldIgnoreFirebaseAuthError } from '../../utils/authErrors';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      toast.success('You are now signed in.');
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setSubmitting(true);

    try {
      await loginWithGoogle();
      toast.success('Signed in with Google.');
      navigate(destination, { replace: true });
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
      <Card title="Welcome back" description="Sign in to continue managing your workspace.">
        <form className="form-stack" onSubmit={handleSubmit}>
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
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleGoogleLogin} disabled={submitting}>
            Continue with Google
          </Button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>
            New here? <Link to="/register">Create an account</Link>
          </span>
        </div>
      </Card>
    </div>
  );
}
