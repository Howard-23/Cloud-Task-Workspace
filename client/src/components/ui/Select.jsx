export default function Select({
  label,
  error,
  hint,
  options = [],
  placeholder,
  className = '',
  id,
  ...props
}) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      {label ? <span className="field__label">{label}</span> : null}
      <select id={id} className={`select ${error ? 'input--error' : ''}`.trim()} {...props}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
