export default function Card({ title, description, action, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || description || action) && (
        <header className="card__header">
          <div>
            {title ? <h3 className="card__title">{title}</h3> : null}
            {description ? <p className="card__description">{description}</p> : null}
          </div>
          {action ? <div className="card__action">{action}</div> : null}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
