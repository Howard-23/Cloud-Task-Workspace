export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="spinner-wrap" aria-live="polite" aria-label={label}>
      <span className="spinner" />
    </div>
  );
}
