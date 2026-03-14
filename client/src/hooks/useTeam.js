import { useEffect, useState } from 'react';

import { getTeamMembers, inviteMember, removeMember } from '../services/teamService';
import { useAuth } from './useAuth';

export function useTeam() {
  const { currentUser, initializing, isAuthenticated } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');

    try {
      const result = await getTeamMembers();
      setMembers(result.members || []);
      return result;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initializing) {
      return;
    }

    if (!isAuthenticated) {
      setMembers([]);
      setError('');
      setLoading(false);
      return;
    }

    refresh().catch(() => undefined);
  }, [currentUser?.uid, initializing, isAuthenticated]);

  async function refreshAfterMutation() {
    try {
      await refresh();
    } catch {
      // Keep the mutation successful even if the member list reload fails afterward.
    }
  }

  async function invite(payload) {
    const member = await inviteMember(payload);
    setMembers((current) => [...current.filter((item) => item.id !== member.id), member]);
    await refreshAfterMutation();
    return member;
  }

  async function remove(userId) {
    const member = await removeMember(userId);
    setMembers((current) => current.filter((item) => item.id !== userId));
    await refreshAfterMutation();
    return member;
  }

  return {
    members,
    loading,
    error,
    refresh,
    invite,
    remove,
  };
}
