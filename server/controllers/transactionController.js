const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

// @desc    Get transactions for logged-in user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      month,
      year,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(
        Number(year),
        Number(month),
        0,
        23,
        59,
        59
      );

      query.date = {
        $gte: start,
        $lte: end
      };
    } else if (year) {
      const start = new Date(Number(year), 0, 1);
      const end = new Date(
        Number(year),
        11,
        31,
        23,
        59,
        59
      );

      query.date = {
        $gte: start,
        $lte: end
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sortField = [
      'date',
      'amount',
      'category',
      'type'
    ].includes(sortBy)
      ? sortBy
      : 'date';

    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const pageNum = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNum = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limitNum),

      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Get a single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: tx
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const tx = await Transaction.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: tx
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const allowedFields = [
      'type',
      'amount',
      'category',
      'description',
      'date',
      'paymentMethod',
      'notes'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        tx[field] = req.body[field];
      }
    });

    await tx.save();

    res.json({
      success: true,
      data: tx
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted',
      data: tx
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Export transactions as CSV
// @route   GET /api/transactions/export/csv
// @access  Private
const exportTransactionsCSV = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id
    }).sort({ date: -1 });

    const header =
      'Date,Type,Category,Amount,Payment Method,Description,Notes\n';

    const rows = transactions.map((t) => {
      const escape = (val) =>
        `"${String(val ?? '').replace(/"/g, '""')}"`;

      return [
        new Date(t.date).toISOString().split('T')[0],
        t.type,
        escape(t.category),
        t.amount,
        t.paymentMethod,
        escape(t.description),
        escape(t.notes),
      ].join(',');
    });

    const csv = header + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="transactions.csv"'
    );

    res.send(csv);
  } catch (err) {
    next(err);
  }
};


// @desc    Wipe all user's transactions
// @route   DELETE /api/transactions/demo/reset
// @access  Private
const resetDemoData = async (req, res, next) => {
  try {
    await Transaction.deleteMany({
      user: req.user._id
    });

    res.json({
      success: true,
      message: 'All transactions cleared'
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCSV,
  resetDemoData,
};