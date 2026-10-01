import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ExpenseDoughnut from '../components/charts/ExpenseDoughnut.jsx';
import { reportService } from '../services/reportService.js';
import { transactionService } from '../services/transactionService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, monthNames } from '../utils/formatters.js';
import {
  IconDownload,
  IconTrendUp,
  IconTrendDown,
} from '../components/icons.jsx';

export default function Reports() {
  const { user } = useAuth();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await reportService.getMonthly({ year, month });
      setReport(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load report'
      );
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const currency = user?.currency || 'USD';

  const years = Array.from(
    { length: 6 },
    (_, i) => now.getFullYear() - i
  );

  return (
    <MainLayout title="Reports">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Monthly financial summaries and category performance.</p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => transactionService.exportCSV()}
        >
          <IconDownload width={16} height={16} />
          Export All (CSV)
        </button>
      </div>

      <div className="card mb-16">
        <div
          className="filters-bar"
          style={{ marginBottom: 0 }}
        >
          <select
            className="input"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {monthNames.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : (
        report && (
          <>
            <div className="grid grid-4 mb-16">
              <StatBox
                label="Income"
                value={formatCurrency(report.income, currency)}
                delta={
                  report.comparisonToPreviousMonth
                    .incomeChangePercent
                }
              />

              <StatBox
                label="Expenses"
                value={formatCurrency(report.expenses, currency)}
                delta={
                  report.comparisonToPreviousMonth
                    .expenseChangePercent
                }
                inverse
              />

              <StatBox
                label="Savings"
                value={formatCurrency(report.savings, currency)}
              />

              <StatBox
                label="Savings Rate"
                value={`${report.savingsRate}%`}
              />
            </div>

            <div className="grid grid-2 mb-16">
              <div className="card chart-card">
                <h3 className="section-title">
                  Category Breakdown
                </h3>

                <ExpenseDoughnut
                  data={report.categoryBreakdown}
                />
              </div>

              <div className="card">
                <h3 className="section-title">
                  Highlights
                </h3>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <Highlight
                    label="Highest Spending Category"
                    value={
                      report.highestSpendingCategory
                        ? `${report.highestSpendingCategory.category} — ${formatCurrency(
                            report.highestSpendingCategory.amount,
                            currency
                          )}`
                        : 'No expenses recorded'
                    }
                  />

                  <Highlight
                    label="Transactions This Month"
                    value={report.transactionCount}
                  />

                  <Highlight
                    label="Income vs Last Month"
                    value={`${
                      report.comparisonToPreviousMonth
                        .incomeChangePercent >= 0
                        ? '+'
                        : ''
                    }${
                      report.comparisonToPreviousMonth
                        .incomeChangePercent
                    }%`}
                    icon={
                      report.comparisonToPreviousMonth
                        .incomeChangePercent >= 0
                        ? IconTrendUp
                        : IconTrendDown
                    }
                  />

                  <Highlight
                    label="Expenses vs Last Month"
                    value={`${
                      report.comparisonToPreviousMonth
                        .expenseChangePercent >= 0
                        ? '+'
                        : ''
                    }${
                      report.comparisonToPreviousMonth
                        .expenseChangePercent
                    }%`}
                    icon={
                      report.comparisonToPreviousMonth
                        .expenseChangePercent >= 0
                        ? IconTrendUp
                        : IconTrendDown
                    }
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">
                Budget Performance
              </h3>

              {report.budgetPerformance.length === 0 ? (
                <p
                  className="text-muted"
                  style={{ fontSize: 13.5 }}
                >
                  No budgets set for this period.
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  {report.budgetPerformance.map((b) => {
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
                            fontSize: 13.5,
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
                            )}{' '}
                            ({b.percentUsed}%)
                          </span>
                        </div>

                        <div className="progress-track">
                          <div
                            className={`progress-fill ${fillClass}`}
                            style={{
                              width: `${Math.min(
                                b.percentUsed,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )
      )}
    </MainLayout>
  );
}

function StatBox({ label, value, delta, inverse }) {
  const isGood =
    typeof delta === 'number'
      ? inverse
        ? delta <= 0
        : delta >= 0
      : null;

  return (
    <div className="card">
      <div className="stat-label">{label}</div>

      <div className="stat-value">{value}</div>

      {typeof delta === 'number' && (
        <div
          className={`stat-delta ${
            isGood ? 'delta-up' : 'delta-down'
          }`}
        >
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs last month
        </div>
      )}
    </div>
  );
}

function Highlight({ label, value, icon: Icon }) {
  return (
    <div className="flex-between">
      <span
        className="text-muted"
        style={{ fontSize: 13 }}
      >
        {label}
      </span>

      <span
        style={{
          fontWeight: 600,
          fontSize: 13.5,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {Icon && <Icon width={13} height={13} />}
        {value}
      </span>
    </div>
  );
}