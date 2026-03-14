export default function EmptyState({ title, description, action }) {
  return (
    <div className="state state--empty">
      <div className="state__eyebrow">CloudTask Pro</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
