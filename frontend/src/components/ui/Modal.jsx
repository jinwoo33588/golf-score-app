import './Modal.css';
import Button from './Button.jsx';

export default function Modal({ open, title, onClose, children, footer }){
  if(!open) return null;
  return (
    <div className="modal__backdrop" role="dialog" aria-modal="true">
      <div className="modal__panel">
        <div className="modal__head">
          <h3 className="modal__title">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="닫기">✕</Button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>
  );
}
