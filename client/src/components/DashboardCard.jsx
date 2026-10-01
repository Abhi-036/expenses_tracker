import React from 'react';

export default function DashboardCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  iconBg,
  iconColor
}) {
  const isUp = typeof delta === 'number' && delta >= 0;

  return (
    <div className="card stat-card">
      <div
        className="stat-icon"
        style={{
          background: iconBg || 'rgba(201,24,74,0.15)',
          color: iconColor || '#e0577f'
        }}
      >
        <Icon width={20} height={20} />
      </div>

      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>

      {typeof delta === 'number' && (
        <div className={`stat-delta ${isUp ? 'delta-up' : 'delta-down'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(delta)}% {deltaLabel || ''}
        </div>
      )}
    </div>
  );
}
