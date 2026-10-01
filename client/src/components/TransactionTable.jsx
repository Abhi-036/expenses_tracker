import React from 'react';
import { formatCurrency, formatDate, capitalize } from '../utils/formatters.js';
import { IconEdit, IconTrash, IconRepeat } from './icons.jsx';
import EmptyState from './EmptyState.jsx';

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  currency
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions found"
        message="Try adjusting your filters, or add a new transaction to get started."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Payment</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr key={t._id}>
              <td>{formatDate(t.date)}</td>

              <td>
                <span className={`badge badge-${t.type}`}>
                  {t.isRecurring && (
                    <IconRepeat width={11} height={11} />
                  )}
                  {t.category}
                </span>
              </td>

              <td className="text-muted">
                {t.description || '—'}
              </td>

              <td className="text-muted">
                {capitalize(
                  (t.paymentMethod || '').replace('_', ' ')
                )}
              </td>

              <td
                style={{
                  fontWeight: 700,
                  color:
                    t.type === 'income'
                      ? 'var(--success)'
                      : 'var(--danger)'
                }}
              >
                {t.type === 'income' ? '+' : '-'}
                {formatCurrency(t.amount, currency)}
              </td>

              <td>
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    justifyContent: 'flex-end'
                  }}
                >
                  <button
                    className="icon-btn"
                    onClick={() => onEdit(t)}
                    aria-label="Edit"
                  >
                    <IconEdit width={14} height={14} />
                  </button>

                  <button
                    className="icon-btn"
                    onClick={() => onDelete(t)}
                    aria-label="Delete"
                  >
                    <IconTrash width={14} height={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
