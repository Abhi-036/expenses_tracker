/**
 * Pure functions for budget math, kept separate from Mongoose/Express
 * so they are trivial to unit test with Jest (no DB required).
 */

// Sums transaction amounts for a given category within [startDate, endDate]
function sumSpentForCategory(transactions, category, startDate, endDate) {
  return transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'expense' &&
        t.category === category &&
        d >= new Date(startDate) &&
        d <= new Date(endDate)
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

// Builds the progress summary for a single budget
function calculateBudgetProgress(budget, transactions) {
  const spent = sumSpentForCategory(
    transactions,
    budget.category,
    budget.startDate,
    budget.endDate
  );

  const limit = budget.limit;
  const remaining = limit - spent;
  const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  let status = 'ok';

  if (percentUsed >= 100) {
    status = 'exceeded';
  } else if (percentUsed >= 80) {
    status = 'warning';
  }

  return {
    spent: Math.round(spent * 100) / 100,
    limit,
    remaining: Math.round(remaining * 100) / 100,
    percentUsed,
    status,
  };
}

module.exports = {
  sumSpentForCategory,
  calculateBudgetProgress
};