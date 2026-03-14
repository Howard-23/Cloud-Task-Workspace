import { useState } from 'react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Textarea from '../ui/Textarea';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import { useComments } from '../../hooks/useComments';
import { formatDate } from '../../utils/formatDate';

export default function CommentThread({ entityType, entityId, title = 'Comments' }) {
  const { comments, loading, error, addComment, refresh } = useComments(entityType, entityId);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!body.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await addComment(body.trim());
      setBody('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title={title}>
      <div className="comment-thread">
        <form className="form-stack" onSubmit={handleSubmit}>
          <Textarea
            label="Add a comment"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Share context, blockers, or next steps."
          />
          <div className="inline-actions">
            <Button type="submit" disabled={submitting || !body.trim()}>
              {submitting ? 'Posting...' : 'Post comment'}
            </Button>
          </div>
        </form>

        {error ? <ErrorState description={error} action={<Button onClick={() => refresh()}>Retry</Button>} /> : null}

        {loading ? <p>Loading comments...</p> : null}

        {!loading && !error && comments.length ? (
          <div className="comment-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <Avatar name={comment.userName} src={comment.userAvatarUrl} />
                <div className="comment-item__body">
                  <div className="comment-item__meta">
                    <strong>{comment.userName || 'Workspace user'}</strong>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                  <p>{comment.body}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && !error && !comments.length ? (
          <EmptyState title="No comments yet" description="Start the thread for this work item." />
        ) : null}
      </div>
    </Card>
  );
}
