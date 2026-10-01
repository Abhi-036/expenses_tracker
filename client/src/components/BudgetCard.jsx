import React from 'react';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { IconEdit, IconTrash } from './icons.jsx';

export default function BudgetCard({
  budget,
  onEdit,
  onDelete,
  currency
}) {
  const fillClass =
    budget.status === 'exceeded'
      ? 'fill-exceeded'
      : budget.status === 'warning'
        ? 'fill-warning'
        : 'fill-ok';

  const badgeClass = `badge-${budget.status}`;

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            {budget.category}
          </div>

          <div
            className="text-muted"
            style={{ fontSize: 12 }}
          >
            {formatDate(budget.startDate)} –{' '}
            {formatDate(budget.endDate)}
          </div>
        </div>

        <span className={`badge ${badgeClass}`}>
          {budget.status === 'exceeded'
            ? 'Over budget'
            : budget.status === 'warning'
              ? 'Near limit'
              : 'On track'}
        </span>
      </div>

      <div className="progress-track">
        <div
          className={`progress-fill ${fillClass}`}
          style={{
            width: `${Math.min(
              budget.percentUsed,
              100
            )}%`
          }}
        />
      </div>

      <div
        className="flex-between mt-16"
        style={{ fontSize: 13.5 }}
      >
        <span className="text-muted">
          {formatCurrency(budget.spent, currency)} spent
        </span>

        <span style={{ fontWeight: 600 }}>
          {formatCurrency(budget.limit, currency)} limit
        </span>
      </div>

      <div
        className="flex-between"
        style={{ marginTop: 14 }}
      >
        <span
          className="text-muted"
          style={{ fontSize: 12.5 }}
        >
          {budget.remaining >= 0
            ? `${formatCurrency(
                budget.remaining,
                currency
              )} remaining`
            : `${formatCurrency(
                Math.abs(budget.remaining),
                currency
              )} over`}
        </span>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="icon-btn"
            onClick={() => onEdit(budget)}
          >
            <IconEdit width={14} height={14} />
          </button>

          <button
            className="icon-btn"
            onClick={() => onDelete(budget)}
          >
            <IconTrash width={14} height={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
