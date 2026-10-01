import React from 'react';

export default function Loader({ label }) {
  return (
    <div className="loader-wrap" style={{ flexDirection: 'column', gap: 12 }}>
      <div className="spinner" />
      {label && <span className="text-muted" style={{ fontSize: 13 }}>{label}</span>}
    </div>
  );
}
