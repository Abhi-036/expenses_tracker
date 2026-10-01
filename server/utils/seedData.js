
/**
 * Default categories created automatically for every new user,
 * and a standalone script (npm run seed) that can populate a demo
 * user with sample transactions/budgets so the dashboard looks
 * polished on first launch.
 */
require('dotenv').config();

const DEFAULT_CATEGORIES = [
  { name: 'Salary', type: 'income', color: '#4caf7d', icon: 'wallet' },
  { name: 'Freelance', type: 'income', color: '#4caf7d', icon: 'briefcase' },
  { name: 'Business', type: 'income', color: '#4caf7d', icon: 'building' },
  { name: 'Investment', type: 'income', color: '#4caf7d', icon: 'trending-up' },
  { name: 'Other Income', type: 'income', color: '#4caf7d', icon: 'plus-circle' },
  { name: 'Food', type: 'expense', color: '#e07a5f', icon: 'utensils' },
  { name: 'Shopping', type: 'expense', color: '#c9184a', icon: 'shopping-bag' },
  { name: 'Transportation', type: 'expense', color: '#f2994a', icon: 'car' },
  { name: 'Bills', type: 'expense', color: '#9d4edd', icon: 'file-text' },
  { name: 'Entertainment', type: 'expense', color: '#e0a458', icon: 'film' },
  { name: 'Healthcare', type: 'expense', color: '#ef476f', icon: 'heart' },
  { name: 'Education', type: 'expense', color: '#5390d9', icon: 'book' },
  { name: 'Rent', type: 'expense', color: '#a13d5f', icon: 'home' },
  { name: 'Travel', type: 'expense', color: '#f77f00', icon: 'plane' },
  { name: 'Other Expense', type: 'expense', color: '#8d99ae', icon: 'more-horizontal' },
];

// Only runs when this file is executed directly
async function runStandaloneSeed() {
  const mongoose = require('mongoose');
  const connectDB = require('../config/db');
  const User = require('../models/User');
  const Category = require('../models/Category');
  const Transaction = require('../models/Transaction');
  const Budget = require('../models/Budget');

  await connectDB();

  const demoEmail = 'demo@expensetracker.app';
  let user = await User.findOne({ email: demoEmail });

  if (!user) {
    user = await User.create({
      name: 'Demo User',
      email: demoEmail,
      password: 'demo1234'
    });

    const categoryDocs = DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      user: user._id,
      isDefault: true
    }));

    await Category.insertMany(categoryDocs);

    console.log(`Created demo user: ${demoEmail} / demo1234`);
  }

  await Transaction.deleteMany({ user: user._id });
  await Budget.deleteMany({ user: user._id });

  const today = new Date();
  const sampleTransactions = [];

  const expenseCats = [
    'Food',
    'Shopping',
    'Transportation',
    'Bills',
    'Entertainment',
    'Rent'
  ];

  for (let i = 0; i < 40; i += 1) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(today);

    date.setDate(date.getDate() - daysAgo);

    sampleTransactions.push({
      user: user._id,
      type: 'expense',
      amount: Math.round((Math.random() * 180 + 10) * 100) / 100,
      category: expenseCats[Math.floor(Math.random() * expenseCats.length)],
      description: 'Sample transaction',
      date,
      paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)]
    });
  }

  for (let i = 0; i < 3; i += 1) {
    const date = new Date(today);

    date.setMonth(date.getMonth() - i);
    date.setDate(1);

    sampleTransactions.push({
      user: user._id,
      type: 'income',
      amount: 4200,
      category: 'Salary',
      description: 'Monthly salary',
      date,
      paymentMethod: 'bank_transfer'
    });
  }

  await Transaction.insertMany(sampleTransactions);

  const budgetStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const budgetEnd = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  await Budget.insertMany([
    {
      user: user._id,
      category: 'Food',
      limit: 500,
      period: 'monthly',
      startDate: budgetStart,
      endDate: budgetEnd
    },
    {
      user: user._id,
      category: 'Shopping',
      limit: 300,
      period: 'monthly',
      startDate: budgetStart,
      endDate: budgetEnd
    },
    {
      user: user._id,
      category: 'Entertainment',
      limit: 150,
      period: 'monthly',
      startDate: budgetStart,
      endDate: budgetEnd
    }
  ]);

  console.log('Sample transactions and budgets seeded.');

  await mongoose.disconnect();
}

if (require.main === module) {
  runStandaloneSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { DEFAULT_CATEGORIES };
