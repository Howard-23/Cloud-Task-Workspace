export default function Avatar({ name = 'CloudTask User', src, size = 'md' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return src ? (
    <img className={`avatar avatar--${size}`.trim()} src={src} alt={name} />
  ) : (
    <span className={`avatar avatar--${size}`.trim()} aria-hidden="true">
      {initials}
    </span>
  );
}
