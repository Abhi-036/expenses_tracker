import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import TransactionTable from '../components/TransactionTable.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import Modal from '../components/Modal.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { transactionService } from '../services/transactionService.js';
import { categoryService } from '../services/categoryService.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconPlus,
  IconDownload,
  IconSearch
} from '../components/icons.jsx';

export default function Transactions() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [txRes, catRes] = await Promise.all([
        transactionService.getAll({
          ...filters,
          page,
          limit: 15
        }),
        categoryService.getAll()
      ]);

      setTransactions(txRes.data);
      setPages(txRes.pages);
      setCategories(catRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load transactions'
      );
    } finally {
      setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [
    filters.search,
    filters.type,
    filters.category
  ]);

  const handleSubmit = async (data) => {
    setSubmitting(true);

    try {
      if (editing) {
        await transactionService.update(
          editing._id,
          data
        );
      } else {
        await transactionService.create(data);
      }

      setModalOpen(false);
      setEditing(null);

      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tx) => {
    if (
      !window.confirm(
        `Delete this ${tx.type} of ${tx.amount}?`
      )
    ) {
      return;
    }

    await transactionService.remove(tx._id);
    await load();
  };

  return (
    <MainLayout title="Transactions">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>
            Track, search, and manage all your income
            and expenses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() =>
              transactionService.exportCSV()
            }
          >
            <IconDownload
              width={16}
              height={16}
            />
            Export CSV
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <IconPlus
              width={16}
              height={16}
            />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div
            style={{
              position: 'relative',
              flex: 1,
              minWidth: 200
            }}
          >
            <IconSearch
              style={{
                position: 'absolute',
                left: 12,
                top: 11,
                color: 'var(--text-muted)'
              }}
              width={15}
              height={15}
            />

            <input
              className="input"
              style={{ paddingLeft: 34 }}
              placeholder="Search description, category, notes..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  search: e.target.value
                }))
              }
            />
          </div>

          <select
            className="input"
            value={filters.type}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                type: e.target.value
              }))
            }
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            className="input"
            value={filters.category}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                category: e.target.value
              }))
            }
          >
            <option value="">
              All categories
            </option>

            {categories.map((c) => (
              <option
                key={c._id}
                value={c.name}
              >
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onChange={(e) => {
              const [
                sortBy,
                sortOrder
              ] = e.target.value.split(':');

              setFilters((f) => ({
                ...f,
                sortBy,
                sortOrder
              }));
            }}
          >
            <option value="date:desc">
              Newest first
            </option>

            <option value="date:asc">
              Oldest first
            </option>

            <option value="amount:desc">
              Amount: High to low
            </option>

            <option value="amount:asc">
              Amount: Low to high
            </option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              currency={user?.currency}
              onEdit={(tx) => {
                setEditing(tx);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
            />

            {pages > 1 && (
              <div className="pagination">
                {Array.from(
                  { length: pages },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    className={
                      p === page ? 'active' : ''
                    }
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={
            editing
              ? 'Edit Transaction'
              : 'Add Transaction'
          }
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        >
          <TransactionForm
            initial={editing}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => {
              setModalOpen(false);
              setEditing(null);
            }}
            submitting={submitting}
          />
        </Modal>
      )}
    </MainLayout>
  );
}
