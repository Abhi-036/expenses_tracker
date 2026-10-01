const Transaction = require('../models/Transaction');

// Given a frequency, returns the next date after `from`
function getNextDate(from, frequency) {
  const d = new Date(from);

  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;

    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;

    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;

    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;

    default:
      break;
  }

  return d;
}

/**
 * Generates any transactions that are due for a single recurring rule.
 */
async function processRecurringRule(rule) {
  const created = [];
  const today = new Date();

  let cursor = rule.lastProcessedDate
    ? getNextDate(rule.lastProcessedDate, rule.frequency)
    : new Date(rule.startDate);

  // Safety cap so a bad rule can never loop forever
  let iterations = 0;

  while (
    rule.isActive &&
    cursor <= today &&
    (!rule.endDate || cursor <= rule.endDate) &&
    iterations < 500
  ) {
    const tx = await Transaction.create({
      user: rule.user,
      type: rule.type,
      amount: rule.amount,
      category: rule.category,
      description:
        rule.description || `Recurring: ${rule.category}`,
      date: cursor,
      isRecurring: true,
      recurringId: rule._id,
    });

    created.push(tx);

    rule.lastProcessedDate = cursor;
    cursor = getNextDate(cursor, rule.frequency);
    iterations += 1;
  }

  if (created.length > 0) {
    await rule.save();
  }

  return created;
}

module.exports = {
  getNextDate,
  processRecurringRule
};