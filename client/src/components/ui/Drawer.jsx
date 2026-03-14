import { createPortal } from 'react-dom';

export default function Drawer({ open, onClose, title, children }) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="overlay overlay--drawer" role="presentation" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h3>{title}</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close panel">
            x
          </button>
        </div>
        <div className="drawer__content">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
