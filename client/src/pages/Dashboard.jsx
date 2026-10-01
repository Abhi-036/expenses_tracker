import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import ExpenseDoughnut from '../components/charts/ExpenseDoughnut.jsx';
import IncomeExpenseBar from '../components/charts/IncomeExpenseBar.jsx';
import SpendingLineChart from '../components/charts/SpendingLineChart.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Model from '../components/model.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { reportService } from '../services/reportService.js';
import { transactionService } from '../services/transactionService.js';
import { categoryService } from '../services/categoryService.js';
import { getErrorMessage } from '../services/api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconWallet,
  IconTrendUp,
  IconTrendDown,
  IconTarget,
  IconPlus,
  IconRefreshCcw
} from '../components/icons.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModel, setShowAddModel] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [dashRes, catRes] = await Promise.all([
        reportService.getDashboard({}),
        categoryService.getAll(),
      ]);

      setSummary(dashRes.data);
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

  const handleAddTransaction = async (data) => {
    setSubmitting(true);

    try {
      await transactionService.create(data);
      setShowAddModal(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetDemo = async () => {
    if (
      !window.confirm(
        'This will permanently delete all your transactions. Continue?'
      )
    ) {
      return;
    }

    await transactionService.resetDemoData();
    await load();
  };

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <Loader label="Loading your dashboard..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Dashboard">
        <ErrorMessage message={error} onRetry={load} />
      </MainLayout>
    );
  }

  const currency = user?.currency || 'USD';

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name?.split(' ')[0]}`}
    >
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Here's your complete financial overview.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={handleResetDemo}
          >
            <IconRefreshCcw width={16} height={16} />
            Reset Data
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <IconPlus width={16} height={16} />
            Add Transaction
          </button>
        </div>
      </div>

      {!summary?.hasData ? (
        <EmptyState
          title="No financial data yet"
          message="Add your first transaction to see your dashboard come to life, or run the sample data seed script."
          action={
            <button
              className="btn btn-primary mt-16"
              onClick={() => setShowAddModal(true)}
            >
              Add your first transaction
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-4 mb-16">
            <DashboardCard
              icon={IconWallet}
              label="Current Balance"
              value={formatCurrency(
                summary.balance,
                currency
              )}
              iconBg="rgba(216,162,74,0.15)"
              iconColor="#d8a24a"
            />

            <DashboardCard
              icon={IconTrendUp}
              label="Total Income"
              value={formatCurrency(
                summary.totalIncome,
                currency
              )}
              iconBg="rgba(76,175,125,0.15)"
              iconColor="#4caf7d"
            />

            <DashboardCard
              icon={IconTrendDown}
              label="Total Expenses"
              value={formatCurrency(
                summary.totalExpenses,
                currency
              )}
              iconBg="rgba(239,71,111,0.15)"
              iconColor="#ef476f"
            />

            <DashboardCard
              icon={IconTarget}
              label="This Month's Savings"
              value={formatCurrency(
                summary.monthlySavings,
                currency
              )}
              iconBg="rgba(201,24,74,0.15)"
              iconColor="#c9184a"
            />
          </div>

          <div className="grid grid-2 mb-16">
            <div className="card chart-card">
              <div className="flex-between">
                <h3 className="section-title">
                  Expenses by Category
                </h3>
              </div>

              <ExpenseDoughnut
                data={summary.spendingByCategory}
              />
            </div>

            <div className="card chart-card">
              <h3 className="section-title">
                Income vs Expenses (6 months)
              </h3>

              <IncomeExpenseBar
                data={summary.trend}
              />
            </div>
          </div>

          <div
            className="grid grid-2"
            style={{ gridTemplateColumns: '1.3fr 1fr' }}
          >
            <div className="card chart-card">
              <h3 className="section-title">
                Monthly Spending Trend
              </h3>

              <SpendingLineChart
                data={summary.trend}
              />
            </div>

            <div className="card">
              <h3 className="section-title">
                Recent Transactions
              </h3>

              {summary.recentTransactions.length === 0 ? (
                <EmptyState title="No transactions yet" />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  {summary.recentTransactions.map((t) => (
                    <div
                      key={t._id}
                      className="flex-between"
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13.5
                          }}
                        >
                          {t.category}
                        </div>

                        <div
                          className="text-muted"
                          style={{ fontSize: 12 }}
                        >
                          {formatDate(t.date)}
                        </div>
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          color:
                            t.type === 'income'
                              ? 'var(--success)'
                              : 'var(--danger)',
                          fontSize: 13.5
                        }}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatCurrency(
                          t.amount,
                          currency
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {summary.budgetOverview?.length > 0 && (
            <div className="card mt-16">
              <h3 className="section-title">
                Budget Progress
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                {summary.budgetOverview.map((b) => {
                  const fillClass =
                    b.status === 'exceeded'
                      ? 'fill-exceeded'
                      : b.status === 'warning'
                        ? 'fill-warning'
                        : 'fill-ok';

                  return (
                    <div key={b.category}>
                      <div
                        className="flex-between"
                        style={{
                          marginBottom: 6,
                          fontSize: 13.5
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {b.category}
                        </span>

                        <span className="text-muted">
                          {formatCurrency(
                            b.spent,
                            currency
                          )}{' '}
                          /{' '}
                          {formatCurrency(
                            b.limit,
                            currency
                          )}
                        </span>
                      </div>

                      <div className="progress-track">
                        <div
                          className={`progress-fill ${fillClass}`}
                          style={{
                            width: `${Math.min(
                              b.percentUsed,
                              100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <Modal
          title="Add Transaction"
          onClose={() => setShowAddModal(false)}
        >
          <TransactionForm
            categories={categories}
            onSubmit={handleAddTransaction}
            onCancel={() =>
              setShowAddModal(false)
            }
            submitting={submitting}
          />
        </Modal>
      )}
    </MainLayout>
  );
}
