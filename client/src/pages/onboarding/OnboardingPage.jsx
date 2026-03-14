import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusPill from '../../components/common/StatusPill';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useTeam } from '../../hooks/useTeam';
import { useToast } from '../../hooks/useToast';
import { seedDemoWorkspace } from '../../services/demoService';

function ChecklistItem({ done, label }) {
  return (
    <div className="onboarding-checklist__item">
      <StatusPill value={done ? 'completed' : 'planning'} />
      <span>{label}</span>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useAuth();
  const { projects, refresh: refreshProjects } = useProjects();
  const { tasks, refresh: refreshTasks } = useTasks();
  const { members, refresh: refreshTeam } = useTeam();
  const [seeding, setSeeding] = useState(false);

  async function handleSeedDemo() {
    setSeeding(true);

    try {
      await seedDemoWorkspace();
      await Promise.all([refreshProjects(), refreshTasks(), refreshTeam()]);
      toast.success('Demo workspace created.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Welcome"
        title={`Welcome to CloudTask Pro, ${profile?.name || 'Operator'}`}
        description="Start with a guided setup or seed demo data to explore the workspace immediately."
      />

      <section className="dashboard-grid">
        <Card title="Get started" description="Follow these steps to set up your workspace.">
          <div className="onboarding-checklist">
            <ChecklistItem done={projects.length > 0} label="Create your first project" />
            <ChecklistItem done={members.length > 1} label="Invite a teammate" />
            <ChecklistItem done={tasks.length > 0} label="Create your first task" />
          </div>
          <div className="inline-actions">
            <Link to="/projects/new">
              <Button>Create project</Button>
            </Link>
            <Link to="/team/invite">
              <Button variant="secondary">Invite teammate</Button>
            </Link>
            <Link to="/tasks/new">
              <Button variant="secondary">Create task</Button>
            </Link>
          </div>
        </Card>

        <Card title="Explore with sample data" description="Seed a polished demo workspace instantly.">
          <p>
            This creates one sample project, realistic launch tasks, and activity so new users do not land in an empty
            application.
          </p>
          <div className="inline-actions">
            <Button onClick={handleSeedDemo} disabled={seeding || projects.length > 0}>
              {seeding ? 'Seeding demo...' : 'Create sample workspace'}
            </Button>
            <Link to="/dashboard">
              <Button variant="ghost">Skip for now</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
