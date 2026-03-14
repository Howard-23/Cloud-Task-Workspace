export default function Input({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      {label ? <span className="field__label">{label}</span> : null}
      <input id={id} className={`input ${error ? 'input--error' : ''}`.trim()} {...props} />
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
