const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { calculateBudgetProgress } = require('../utils/budgetCalc');

const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
};

// @desc    Dashboard summary: totals, recent transactions, category breakdown, trend
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const { start, end } = getMonthRange(year, month);

    const allTransactions = await Transaction.find({ user: req.user._id });
    const monthTransactions = allTransactions.filter(
      (t) => new Date(t.date) >= start && new Date(t.date) <= end
    );

    const totalIncome = allTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const totalExpenses = allTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const monthlyIncome = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const monthlyExpenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const categoryMap = {};

    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

    const spendingByCategory = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100
      }))
      .sort((a, b) => b.amount - a.amount);

    const trend = [];

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(year, month - 1 - i, 1);
      const {
        start: mStart,
        end: mEnd
      } = getMonthRange(d.getFullYear(), d.getMonth() + 1);

      const monthTx = allTransactions.filter(
        (t) => new Date(t.date) >= mStart && new Date(t.date) <= mEnd
      );

      trend.push({
        label: mStart.toLocaleString('default', {
          month: 'short',
          year: '2-digit'
        }),
        income: Math.round(
          monthTx
            .filter((t) => t.type === 'income')
            .reduce((s, t) => s + t.amount, 0) * 100
        ) / 100,
        expense: Math.round(
          monthTx
            .filter((t) => t.type === 'expense')
            .reduce((s, t) => s + t.amount, 0) * 100
        ) / 100
      });
    }

    const budgets = await Budget.find({ user: req.user._id });

    const budgetOverview = budgets.map((b) => ({
      category: b.category,
      ...calculateBudgetProgress(b, allTransactions)
    }));

    const recentTransactions = [...allTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    res.json({
      success: true,
      data: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        balance: Math.round((totalIncome - totalExpenses) * 100) / 100,
        monthlyIncome: Math.round(monthlyIncome * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        monthlySavings: Math.round((monthlyIncome - monthlyExpenses) * 100) / 100,
        spendingByCategory,
        trend,
        budgetOverview,
        recentTransactions,
        hasData: allTransactions.length > 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Monthly report for a specific month/year
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;

    const { start, end } = getMonthRange(year, month);

    const prevDate = new Date(year, month - 2, 1);

    const {
      start: prevStart,
      end: prevEnd
    } = getMonthRange(
      prevDate.getFullYear(),
      prevDate.getMonth() + 1
    );

    const allTransactions = await Transaction.find({
      user: req.user._id
    });

    const monthTx = allTransactions.filter(
      (t) => new Date(t.date) >= start && new Date(t.date) <= end
    );

    const prevMonthTx = allTransactions.filter(
      (t) => new Date(t.date) >= prevStart && new Date(t.date) <= prevEnd
    );

    const income = monthTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const expenses = monthTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const prevIncome = prevMonthTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const prevExpenses = prevMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const categoryMap = {};

    monthTx
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryMap[t.category] =
          (categoryMap[t.category] || 0) + t.amount;
      });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100
      }))
      .sort((a, b) => b.amount - a.amount);

    const budgets = await Budget.find({
      user: req.user._id,
      startDate: { $lte: end },
      endDate: { $gte: start }
    });

    const budgetPerformance = budgets.map((b) => ({
      category: b.category,
      ...calculateBudgetProgress(b, allTransactions)
    }));

    const pctChange = (curr, prev) =>
      prev === 0
        ? curr > 0
          ? 100
          : 0
        : Math.round(((curr - prev) / prev) * 100);

    res.json({
      success: true,
      data: {
        year,
        month,
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        savings: Math.round((income - expenses) * 100) / 100,
        savingsRate:
          income > 0
            ? Math.round(((income - expenses) / income) * 100)
            : 0,
        categoryBreakdown,
        highestSpendingCategory: categoryBreakdown[0] || null,
        budgetPerformance,
        comparisonToPreviousMonth: {
          incomeChangePercent: pctChange(income, prevIncome),
          expenseChangePercent: pctChange(expenses, prevExpenses)
        },
        transactionCount: monthTx.length
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardSummary,
  getMonthlyReport
};
