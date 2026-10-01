import React from 'react';
import { IconAlertCircle } from './icons.jsx';

export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="error-state">
      <IconAlertCircle width={36} height={36} />
      <h3>We hit a snag</h3>
      <p style={{ maxWidth: 320 }}>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm mt-16" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
