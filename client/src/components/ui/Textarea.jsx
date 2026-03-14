export default function Textarea({
  label,
  error,
  hint,
  className = '',
  id,
  rows = 4,
  ...props
}) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      {label ? <span className="field__label">{label}</span> : null}
      <textarea id={id} rows={rows} className={`textarea ${error ? 'input--error' : ''}`.trim()} {...props} />
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
