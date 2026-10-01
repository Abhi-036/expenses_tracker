import React, { useState } from 'react';
import { getErrorMessage } from '../services/api.js';

export default function BudgetForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  submitting
}) {
  const [form, setForm] = useState({
    category: initial?.category || '',
    limit: initial?.limit || '',
    period: initial?.period || 'monthly',
    startDate: initial?.startDate
      ? initial.startDate.substring(0, 10)
      : new Date().toISOString().substring(0, 10),
  });

  const [error, setError] = useState('');

  const expenseCategories = categories.filter(
    (c) => c.type === 'expense'
  );

  const handleChange = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.value
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.category) {
      return setError(
        'Please select a category.'
      );
    }

    if (!form.limit || Number(form.limit) <= 0) {
      return setError(
        'Enter a valid budget limit.'
      );
    }

    try {
      await onSubmit({
        ...form,
        limit: Number(form.limit)
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
        <label>Category</label>

        <select
          className="input"
          value={form.category}
          onChange={handleChange('category')}
          disabled={!!initial}
        >
          <option value="">
            Select a category
          </option>

          {expenseCategories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Monthly Limit</label>

          <input
            className="input"
            type="number"
            step="0.01"
            min="1"
            placeholder="0.00"
            value={form.limit}
            onChange={handleChange('limit')}
          />
        </div>

        <div className="form-group">
          <label>Period</label>

          <select
            className="input"
            value={form.period}
            onChange={handleChange('period')}
          >
            <option value="monthly">
              Monthly
            </option>

            <option value="yearly">
              Yearly
            </option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Start Date</label>

        <input
          className="input"
          type="date"
          value={form.startDate}
          onChange={handleChange('startDate')}
        />
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
              ? 'Update Budget'
              : 'Create Budget'}
        </button>
      </div>
    </form>
  );
}
