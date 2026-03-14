import { Link } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function UnauthorizedPage() {
  return (
    <div className="auth-shell">
      <Card
        title="Access restricted"
        description="Your account is signed in, but this action or page requires more permissions."
      >
        <div className="form-stack">
          <p>Return to the dashboard or sign in with an account that has the required role.</p>
          <div className="inline-actions">
            <Link to="/dashboard">
              <Button>Go to dashboard</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Sign in again</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
