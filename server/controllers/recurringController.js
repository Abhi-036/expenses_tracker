
const RecurringTransaction = require('../models/RecurringTransaction');
const { processRecurringRule } = require('../utils/recurringProcessor');

// @desc    Get all recurring rules for the user
// @route   GET /api/recurring-transactions
// @access  Private
const getRecurring = async (req, res, next) => {
  try {
    const rules = await RecurringTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: rules.length, data: rules });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a recurring rule
// @route   POST /api/recurring-transactions
// @access  Private
const createRecurring = async (req, res, next) => {
  try {
    const { type, amount, category, description, frequency, startDate, endDate } = req.body;

    if (!type || !amount || !category || !frequency || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const rule = await RecurringTransaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      description,
      frequency,
      startDate,
      endDate: endDate || null,
    });

    // Immediately generate any transactions already due
    const created = await processRecurringRule(rule);

    res.status(201).json({
      success: true,
      data: rule,
      generated: created.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a recurring rule
// @route   PUT /api/recurring-transactions/:id
// @access  Private
const updateRecurring = async (req, res, next) => {
  try {
    const rule = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Recurring rule not found'
      });
    }

    const allowedFields = [
      'type',
      'amount',
      'category',
      'description',
      'frequency',
      'endDate',
      'isActive'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        rule[field] = req.body[field];
      }
    });

    await rule.save();

    res.json({
      success: true,
      data: rule
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a recurring rule
// @route   DELETE /api/recurring-transactions/:id
// @access  Private
const deleteRecurring = async (req, res, next) => {
  try {
    const rule = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Recurring rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Recurring rule deleted'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Process all active recurring rules for the user
// @route   POST /api/recurring-transactions/process
// @access  Private
const processAllRecurring = async (req, res, next) => {
  try {
    const rules = await RecurringTransaction.find({
      user: req.user._id,
      isActive: true
    });

    let totalGenerated = 0;

    for (const rule of rules) {
      const created = await processRecurringRule(rule);
      totalGenerated += created.length;
    }

    res.json({
      success: true,
      message: `${totalGenerated} transaction(s) generated`,
      generated: totalGenerated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  processAllRecurring
};
