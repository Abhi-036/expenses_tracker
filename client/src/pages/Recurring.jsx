import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import Model from '../components/model.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

import { recurringService } from '../services/recurringService.js';
import { categoryService } from '../services/categoryService.js';
import { getErrorMessage } from '../services/api.js';

import {
  formatCurrency,
  formatDate,
  capitalize,
} from '../utils/formatters.js';

import { useAuth } from '../context/AuthContext.jsx';

import {
  IconPlus,
  IconTrash,
  IconRefreshCcw,
} from '../components/icons.jsx';

export default function Recurring() {
  const { user } = useAuth();

  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ModelOpen, setModelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [ruleRes, catRes] = await Promise.all([
        recurringService.getAll(),
        categoryService.getAll(),
      ]);

      setRules(ruleRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.amount || Number(form.amount) <= 0) {
      return setFormError('Enter a valid amount.');
    }

    if (!form.category) {
      return setFormError('Please select a category.');
    }

    if (!form.startDate) {
      return setFormError('Please select a start date.');
    }

    setSubmitting(true);

    try {
      await recurringService.create({
        ...form,
        amount: Number(form.amount),
        endDate: form.endDate || null,
      });

      setModelOpen(false);

      setForm({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: '',
      });

      await load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rule) => {
    if (
      !window.confirm(
        `Delete this recurring ${rule.type} transaction?`
      )
    ) {
      return;
    }

    try {
      await recurringService.remove(rule._id);
      await load();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const handleProcess = async () => {
    try {
      const res = await recurringService.processAll();

      window.alert(
        res?.message || 'Recurring transactions processed successfully.'
      );

      await load();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const filteredCategories = categories.filter(
    (c) => c.type === form.type
  );

  const openModel = () => {
    setFormError('');
    setModelOpen(true);
  };

  const closeModel = () => {
    if (submitting) return;

    setModelOpen(false);
    setFormError('');
  };

  return (
    <MainLayout title="Recurring Transactions">
      <div className="page-header">
        <div>
          <h1>Recurring Transactions</h1>
          <p>
            Automate income and expenses that repeat on a schedule.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={handleProcess}
          >
            <IconRefreshCcw width={16} height={16} />
            Run Now
          </button>

          <button
            className="btn btn-primary"
            onClick={openModel}
          >
            <IconPlus width={16} height={16} />
            New Recurring Rule
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        ) : rules.length === 0 ? (
          <EmptyState
            title="No recurring transactions"
            message="Set up rules for things like rent, salary, or subscriptions and they'll be generated automatically."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {rules.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <span className={`badge badge-${r.type}`}>
                        {r.category}
                      </span>
                    </td>

                    <td
                      style={{
                        fontWeight: 700,
                        color:
                          r.type === 'income'
                            ? 'var(--success)'
                            : 'var(--danger)',
                      }}
                    >
                      {r.type === 'income' ? '+' : '-'}
                      {formatCurrency(
                        r.amount,
                        user?.currency
                      )}
                    </td>

                    <td>
                      {capitalize(r.frequency)}
                    </td>

                    <td className="text-muted">
                      {formatDate(r.startDate)}
                    </td>

                    <td className="text-muted">
                      {r.endDate
                        ? formatDate(r.endDate)
                        : 'None'}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          r.isActive
                            ? 'badge-ok'
                            : 'badge-exceeded'
                        }`}
                      >
                        {r.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>

                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => handleDelete(r)}
                        title="Delete"
                      >
                        <IconTrash
                          width={14}
                          height={14}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {ModelOpen && (
        <Model
          title="New Recurring Rule"
          onClose={closeModel}
        >
          <form onSubmit={handleCreate}>
            {formError && (
              <div className="alert alert-error">
                {formError}
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
                      type: 'income',
                      category: '',
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
                      type: 'expense',
                      category: '',
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
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      amount: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>

                <select
                  className="input"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  {filteredCategories.map((c) => (
                    <option
                      key={c._id}
                      value={c.name}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description (optional)</label>

              <input
                className="input"
                placeholder="e.g. Monthly rent"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Frequency</label>

                <select
                  className="input"
                  value={form.frequency}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      frequency: e.target.value,
                    }))
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>

                <input
                  className="input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      startDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>End Date (optional)</label>

              <input
                className="input"
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 8,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={closeModel}
                disabled={submitting}
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
                  : 'Create Rule'}
              </button>
            </div>
          </form>
        </Model>
      )}
    </MainLayout>
  );
}