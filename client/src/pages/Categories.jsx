import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import Model from '../components/model.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { categoryService } from '../services/categoryService.js';
import { getErrorMessage } from '../services/api.js';
import {
  IconPlus,
  IconTrash,
  IconTag
} from '../components/icons.jsx';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ModelOpen, setModelOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'expense',
    color: '#c9184a'
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await categoryService.getAll();
      setCategories(res.data);
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

    if (!form.name.trim()) {
      return setFormError(
        'Category name is required.'
      );
    }

    setSubmitting(true);

    try {
      await categoryService.create(form);

      setModelOpen(false);

      setForm({
        name: '',
        type: 'expense',
        color: '#c9184a'
      });

      await load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `Delete category "${cat.name}"?`
      )
    ) {
      return;
    }

    try {
      await categoryService.remove(cat._id);
      await load();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const income = categories.filter(
    (c) => c.type === 'income'
  );

  const expense = categories.filter(
    (c) => c.type === 'expense'
  );

  return (
    <MainLayout title="Categories">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p>
            Organize your income and expenses with custom
            categories.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setModelOpen(true)}
        >
          <IconPlus width={16} height={16} />
          New Category
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={load}
        />
      ) : (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="section-title">
              Income Categories
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              {income.map((c) => (
                <CategoryRow
                  key={c._id}
                  cat={c}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">
              Expense Categories
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              {expense.map((c) => (
                <CategoryRow
                  key={c._id}
                  cat={c}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {ModelOpen && (
        <Model
          title="New Category"
          onClose={() => setModelOpen(false)}
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

            <div className="form-group">
              <label>Name</label>

              <input
                className="input"
                placeholder="e.g. Pet Care"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label>Color</label>

              <input
                className="input"
                type="color"
                value={form.color}
                style={{
                  height: 44,
                  padding: 4
                }}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    color: e.target.value
                  }))
                }
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
                style={{ flex: 1 }}
                onClick={() =>
                  setModelOpen(false)
                }
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
                  : 'Create Category'}
              </button>
            </div>
          </form>
        </Model>
      )}
    </MainLayout>
  );
}

function CategoryRow({ cat, onDelete }) {
  return (
    <div
      className="flex-between"
      style={{
        padding: '8px 10px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.02)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: cat.color
          }}
        />

        <span style={{ fontSize: 13.5 }}>
          {cat.name}
        </span>

        {cat.isDefault && (
          <span
            className="text-muted"
            style={{ fontSize: 11 }}
          >
            (default)
          </span>
        )}
      </div>

      {!cat.isDefault && (
        <button
          className="icon-btn"
          onClick={() => onDelete(cat)}
        >
          <IconTrash
            width={13}
            height={13}
          />
        </button>
      )}
    </div>
  );
}
