import { createPortal } from 'react-dom';

import { useToast } from '../../hooks/useToast';

export default function Toast() {
  const { dismissToast, toasts } = useToast();

  if (!toasts.length || typeof document === 'undefined') return null;

  return createPortal(
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <article key={toast.id} className={`toast toast--${toast.variant}`.trim()}>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button type="button" className="icon-button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
            ×
          </button>
        </article>
      ))}
    </div>,
    document.body,
  );
}
