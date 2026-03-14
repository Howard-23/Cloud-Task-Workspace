export default function ErrorState({ title = 'Unable to load this view', description, action }) {
  return (
    <div className="state state--error">
      <div className="state__eyebrow">System Notice</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
