import { Link } from 'react-router-dom';
import { useState } from 'react';

import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import StatusPill from '../../components/common/StatusPill';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Table from '../../components/ui/Table';
import { useTeam } from '../../hooks/useTeam';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatDate';

export default function TeamPage() {
  const { members, loading, error, remove } = useTeam();
  const toast = useToast();
  const [memberToRemove, setMemberToRemove] = useState(null);

  async function handleRemoveMember() {
    if (!memberToRemove) return;

    try {
      await remove(memberToRemove.id);
      toast.success('Member removed.');
      setMemberToRemove(null);
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  if (error) {
    return <ErrorState description={error} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Team"
        title="Workspace members"
        description="View workspace roles and manage member access."
        actions={
          <Link to="/team/invite">
            <Button>Invite member</Button>
          </Link>
        }
      />

      {loading ? (
        <Card title="Loading members">Syncing workspace directory...</Card>
      ) : members.length ? (
        <Card>
          <Table
            columns={[
              { key: 'name', label: 'Member' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', render: (row) => <StatusPill value={row.role} /> },
              { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Button size="sm" variant="danger" onClick={() => setMemberToRemove(row)}>
                    Remove
                  </Button>
                ),
              },
            ]}
            rows={members}
          />
        </Card>
      ) : (
        <EmptyState title="No team members yet" description="Invite your first collaborator to the workspace." />
      )}

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        title="Remove team member?"
        description="This deletes the member record and related workspace access."
        confirmLabel="Remove member"
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
      />
    </div>
  );
}
