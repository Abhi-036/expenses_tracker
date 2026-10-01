import React, { useState, useEffect } from 'react';
import { getErrorMessage } from '../services/api.js';

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Other' },
];

export default function TransactionForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  submitting
}) {
  const [form, setForm] = useState({
    type: initial?.type || 'expense',
    amount: initial?.amount || '',
    category: initial?.category || '',
    description: initial?.description || '',
    date: initial?.date
      ? initial.date.substring(0, 10)
      : new Date().toISOString().substring(0, 10),
    paymentMethod: initial?.paymentMethod || 'card',
    notes: initial?.notes || '',
  });

  const [error, setError] = useState('');

  const filteredCategories = categories.filter(
    (c) => c.type === form.type
  );

  useEffect(() => {
    if (
      form.category &&
      !categories.some(
        (c) =>
          c.name === form.category &&
          c.type === form.type
      )
    ) {
      setForm((f) => ({ ...f, category: '' }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);

  const handleChange = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.value
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.amount || Number(form.amount) <= 0) {
      return setError(
        'Enter a valid amount greater than 0.'
      );
    }

    if (!form.category) {
      return setError(
        'Please select a category.'
      );
    }

    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount)
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Type</label>

        <div className="toggle-group">
          <button
            type="button"
            className={`toggle-btn ${
              form.type === 'income'
                ? 'active-income'
                : ''
            }`}
            onClick={() =>
              setForm((f) => ({
                ...f,
                type: 'income'
              }))
            }
          >
            Income
          </button>

          <button
            type="button"
            className={`toggle-btn ${
              form.type === 'expense'
                ? 'active-expense'
                : ''
            }`}
            onClick={() =>
              setForm((f) => ({
                ...f,
                type: 'expense'
              }))
            }
          >
            Expense
          </button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Amount</label>

          <input
            className="input"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange('amount')}
          />
        </div>

        <div className="form-group">
          <label>Date</label>

          <input
            className="input"
            type="date"
            value={form.date}
            onChange={handleChange('date')}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Category</label>

        <select
          className="input"
          value={form.category}
          onChange={handleChange('category')}
        >
          <option value="">
            Select a category
          </option>

          {filteredCategories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>

        <input
          className="input"
          placeholder="e.g. Grocery run at Whole Foods"
          value={form.description}
          onChange={handleChange('description')}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Payment Method</label>

          <select
            className="input"
            value={form.paymentMethod}
            onChange={handleChange('paymentMethod')}
          >
            {paymentMethods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>

          <input
            className="input"
            placeholder="Anything else..."
            value={form.notes}
            onChange={handleChange('notes')}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 8
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ flex: 1 }}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ flex: 1 }}
          disabled={submitting}
        >
          {submitting
            ? 'Saving...'
            : initial
              ? 'Update'
              : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
