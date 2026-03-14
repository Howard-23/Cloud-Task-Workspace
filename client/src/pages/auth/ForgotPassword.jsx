import { Link } from 'react-router-dom';
import { useState } from 'react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await forgotPassword(email);
      toast.success('Password reset email sent.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <Card title="Reset your password" description="We will send a reset link to your inbox.">
        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending link...' : 'Send reset link'}
          </Button>
        </form>
        <div className="auth-links">
          <Link to="/login">Return to sign in</Link>
        </div>
      </Card>
    </div>
  );
}
