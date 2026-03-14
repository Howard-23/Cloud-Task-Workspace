import Button from './Button';

export default function Pagination({ page = 1, totalPages = 1, total = 0, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <p className="pagination__summary">
        Page {page} of {totalPages}
        <span>{total} total records</span>
      </p>
      <div className="inline-actions">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
