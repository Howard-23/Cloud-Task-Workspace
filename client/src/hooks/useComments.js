import { useEffect, useState } from 'react';

import { createComment as createCommentRequest, getComments } from '../services/commentService';
import { useAuth } from './useAuth';

export function useComments(entityType, entityId) {
  const { currentUser, initializing, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    if (!entityType || !entityId) {
      setComments([]);
      setLoading(false);
      return { comments: [] };
    }

    setLoading(true);
    setError('');

    try {
      const result = await getComments(entityType, entityId);
      setComments(result.comments || []);
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

    if (!isAuthenticated || !entityType || !entityId) {
      setComments([]);
      setError('');
      setLoading(false);
      return;
    }

    refresh().catch(() => undefined);
  }, [currentUser?.uid, entityId, entityType, initializing, isAuthenticated]);

  async function addComment(body) {
    const comment = await createCommentRequest({ entityType, entityId, body });
    setComments((current) => [...current, comment]);
    return comment;
  }

  return {
    comments,
    loading,
    error,
    refresh,
    addComment,
  };
}
