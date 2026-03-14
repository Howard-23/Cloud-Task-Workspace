import Navbar from '../../components/layout/Navbar';
import Card from '../../components/ui/Card';

const featureGroups = [
  {
    title: 'Delivery operations',
    items: ['Dashboard metrics', 'Upcoming deadlines', 'Recent activity log', 'Quick actions'],
  },
  {
    title: 'Project control',
    items: ['Project CRUD', 'Member assignment', 'Status tracking', 'Project detail workspace'],
  },
  {
    title: 'Task execution',
    items: ['Task list and kanban views', 'Priority and status filters', 'Due date tracking', 'Assignee mapping'],
  },
  {
    title: 'Admin surface',
    items: ['Firebase-backed auth', 'Workspace member management', 'Theme settings', 'Profile controls'],
  },
];

export default function Features() {
  return (
    <div className="public-shell">
      <Navbar />
      <main className="landing landing--narrow">
        <section className="page-hero">
          <p className="page-header__eyebrow">Capabilities</p>
          <h1>Everything required to run premium project delivery workflows.</h1>
          <p>
            The app is structured as a Vercel-friendly React frontend plus serverless Node API handlers
            backed by Firebase Auth and Neon PostgreSQL.
          </p>
        </section>

        <section className="section-grid section-grid--double">
          {featureGroups.map((group) => (
            <Card key={group.title} title={group.title}>
              <ul className="stack-list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
