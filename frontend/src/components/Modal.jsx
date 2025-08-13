// src/components/Modal.jsx
import React, { useEffect } from 'react';
import './Modal.css'; // 필요시

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden'; // 백스크롤 방지
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="gt-modal-backdrop" onClick={onClose}>
      <div className="gt-modal" onClick={(e) => e.stopPropagation()}>
        {title && <div className="gt-modal-title">{title}</div>}
        <div className="gt-modal-body">{children}</div>
      </div>
    </div>
  );
}
