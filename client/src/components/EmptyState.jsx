import React from 'react';
import { IconInbox } from './icons.jsx';

export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <IconInbox width={40} height={40} />
      <h3>{title}</h3>
      {message && <p style={{ maxWidth: 320 }}>{message}</p>}
      {action}
    </div>
  );
}
