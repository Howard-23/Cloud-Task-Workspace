import { Link } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function NotFoundPage() {
  return (
    <div className="auth-shell">
      <Card title="Page not found" description="The page you requested does not exist or has been moved.">
        <div className="form-stack">
          <p>Use the dashboard or return to the public homepage.</p>
          <div className="inline-actions">
            <Link to="/dashboard">
              <Button>Go to dashboard</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Back to home</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
