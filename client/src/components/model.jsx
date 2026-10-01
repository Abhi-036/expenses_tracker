import React, { useEffect } from 'react';
import { IconX } from './icons.jsx';

export default function Model({ title, onClose, children, maxWidth = 480 }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="model-backdrop"
      onMouseDown={(e) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div className="model-box" style={{ maxWidth }}>
        <div className="model-header">
          <h3>{title}</h3>

          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <IconX width={16} height={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
