const { calculateBudgetProgress, sumSpentForCategory } = require('../utils/budgetCalc');

describe('budgetCalc utilities (pure functions, no DB required)', () => {
  const transactions = [
    { type: 'expense', category: 'Food', amount: 50, date: '2026-08-05' },
    { type: 'expense', category: 'Food', amount: 30, date: '2026-08-10' },
    { type: 'expense', category: 'Shopping', amount: 100, date: '2026-08-12' },
    { type: 'income', category: 'Salary', amount: 4000, date: '2026-08-01' },
  ];

  test('sumSpentForCategory only sums expenses in range for the given category', () => {
    const total = sumSpentForCategory(
      transactions,
      'Food',
      '2026-08-01',
      '2026-08-31'
    );

    expect(total).toBe(80);
  });

  test('sumSpentForCategory excludes transactions outside the date range', () => {
    const total = sumSpentForCategory(
      transactions,
      'Food',
      '2026-08-06',
      '2026-08-31'
    );

    expect(total).toBe(30);
  });

  test('calculateBudgetProgress returns "ok" status when under 80%', () => {
    const budget = {
      category: 'Food',
      limit: 200,
      startDate: '2026-08-01',
      endDate: '2026-08-31'
    };

    const result = calculateBudgetProgress(budget, transactions);

    expect(result.spent).toBe(80);
    expect(result.remaining).toBe(120);
    expect(result.percentUsed).toBe(40);
    expect(result.status).toBe('ok');
  });

  test('calculateBudgetProgress returns "warning" status at 80% or more', () => {
    const budget = {
      category: 'Food',
      limit: 100,
      startDate: '2026-08-01',
      endDate: '2026-08-31'
    };

    const result = calculateBudgetProgress(budget, transactions);

    expect(result.percentUsed).toBe(80);
    expect(result.status).toBe('warning');
  });

  test('calculateBudgetProgress returns "exceeded" status when over 100%', () => {
    const budget = {
      category: 'Shopping',
      limit: 50,
      startDate: '2026-08-01',
      endDate: '2026-08-31'
    };

    const result = calculateBudgetProgress(budget, transactions);

    expect(result.percentUsed).toBe(200);
    expect(result.status).toBe('exceeded');
    expect(result.remaining).toBe(-50);
  });
});
