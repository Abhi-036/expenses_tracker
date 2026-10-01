import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import BudgetCard from '../components/BudgetCard.jsx';
import BudgetForm from '../components/BudgetForm.jsx';
import Modal from '../components/Modal.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { budgetService } from '../services/budgetService.js';
import { categoryService } from '../services/categoryService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { IconPlus } from '../components/icons.jsx';

export default function Budgets() {
  const { user } = useAuth();

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [budRes, catRes] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll('expense')
      ]);

      setBudgets(budRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load budgets'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (data) => {
    setSubmitting(true);

    try {
      if (editing) {
        await budgetService.update(editing._id, data);
      } else {
        await budgetService.create(data);
      }

      setModalOpen(false);
      setEditing(null);

      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (budget) => {
    if (
      !window.confirm(
        `Delete the budget for ${budget.category}?`
      )
    ) {
      return;
    }

    await budgetService.remove(budget._id);
    await load();
  };

  return (
    <MainLayout title="Budgets">
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <p>
            Set spending limits by category and track
            your progress.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <IconPlus width={16} height={16} />
          New Budget
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={load}
        />
      ) : budgets.length === 0 ? (
        <EmptyState
          title="No budgets yet"
          message="Create a budget to start tracking spending limits by category."
          action={
            <button
              className="btn btn-primary mt-16"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Create your first budget
            </button>
          }
        />
      ) : (
        <div className="grid grid-3">
          {budgets.map((b) => (
            <BudgetCard
              key={b._id}
              budget={b}
              currency={user?.currency}
              onEdit={(bud) => {
                setEditing(bud);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={
            editing ? 'Edit Budget' : 'New Budget'
          }
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        >
          <BudgetForm
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
