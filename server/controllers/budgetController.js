const { validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { calculateBudgetProgress } = require('../utils/budgetCalc');

// @desc    Get all budgets with progress info
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user: req.user._id
    }).sort({ startDate: -1 });

    const transactions = await Transaction.find({
      user: req.user._id,
      type: 'expense'
    });

    const withProgress = budgets.map((b) => {
      const progress = calculateBudgetProgress(
        b,
        transactions
      );

      return {
        ...b.toObject(),
        ...progress
      };
    });

    res.json({
      success: true,
      count: withProgress.length,
      data: withProgress
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Get single budget with progress
// @route   GET /api/budgets/:id
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const transactions = await Transaction.find({
      user: req.user._id,
      type: 'expense'
    });

    const progress = calculateBudgetProgress(
      budget,
      transactions
    );

    res.json({
      success: true,
      data: {
        ...budget.toObject(),
        ...progress
      }
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Create a budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const {
      category,
      limit,
      period,
      startDate,
      endDate
    } = req.body;

    let computedEnd = endDate;

    if (!computedEnd) {
      const start = new Date(startDate);

      computedEnd =
        period === 'yearly'
          ? new Date(
              start.getFullYear(),
              11,
              31,
              23,
              59,
              59
            )
          : new Date(
              start.getFullYear(),
              start.getMonth() + 1,
              0,
              23,
              59,
              59
            );
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      limit,
      period: period || 'monthly',
      startDate,
      endDate: computedEnd
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const allowedFields = [
      'category',
      'limit',
      'period',
      'startDate',
      'endDate'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        budget[field] = req.body[field];
      }
    });

    await budget.save();

    res.json({
      success: true,
      data: budget
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      message: 'Budget deleted'
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
};