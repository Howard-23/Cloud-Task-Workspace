import { createPortal } from 'react-dom';

export default function Modal({ open, title, children, onClose, footer }) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h3>{title}</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">
            x
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
