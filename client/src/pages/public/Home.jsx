import { Link } from 'react-router-dom';

import Navbar from '../../components/layout/Navbar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const highlights = [
  'Secure Firebase authentication',
  'Neon Postgres-backed projects and tasks',
  'Vercel-native serverless API architecture',
];

const metrics = [
  { value: '38%', label: 'faster sprint planning' },
  { value: '24h', label: 'average onboarding time' },
  { value: '4.9/5', label: 'team satisfaction score' },
];

export default function Home() {
  return (
    <div className="public-shell">
      <Navbar />

      <main className="landing">
        <section className="hero">
          <div className="hero__content">
            <Badge tone="info">Premium work orchestration for modern product teams</Badge>
            <h1>Operate projects, tasks, and team workflows from one executive-ready dashboard.</h1>
            <p>
              CloudTask Pro combines structured delivery tracking, task boards, activity visibility, and
              workspace controls in a Vercel-friendly SaaS stack.
            </p>
            <div className="hero__actions">
              <Link to="/register">
                <Button>Launch Workspace</Button>
              </Link>
              <Link to="/features">
                <Button variant="secondary">Explore Features</Button>
              </Link>
            </div>
            <ul className="hero__list">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="hero__panel">
            <Card title="Board pulse" description="Live operational snapshot">
              <div className="metric-stack">
                {metrics.map((metric) => (
                  <div key={metric.label} className="metric-stack__item">
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="What teams get" description="Designed for agencies, product teams, and consultancies">
              <div className="pill-grid">
                <span>Project portfolio</span>
                <span>Kanban board</span>
                <span>Member roles</span>
                <span>Activity feed</span>
                <span>Dashboard metrics</span>
                <span>Settings center</span>
              </div>
            </Card>
          </div>
        </section>

        <section className="section-grid">
          <Card title="Dashboard-grade clarity" description="Know what is moving, blocked, and overdue.">
            <p>Metrics, deadlines, and recent activity are surfaced without requiring heavy BI setup.</p>
          </Card>
          <Card title="Structured project delivery" description="Projects, members, and tasks stay connected.">
            <p>Assign members, organize priorities, and keep every task anchored to project context.</p>
          </Card>
          <Card title="Secure app foundation" description="Firebase Auth, Neon PostgreSQL, and Vercel APIs.">
            <p>The codebase is modular and deployment-friendly from day one.</p>
          </Card>
        </section>

        <section className="testimonial-strip">
          <p>"CloudTask Pro finally gave our client delivery team a workspace that feels enterprise-ready."</p>
          <span>Ops Lead, digital consultancy</span>
        </section>
      </main>
    </div>
  );
}
