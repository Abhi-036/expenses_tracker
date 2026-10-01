const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    limit: {
      type: Number,
      required: true,
      min: [1, 'Budget limit must be greater than 0']
    },
    period: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
  },
  { timestamps: true }
);

BudgetSchema.index({
  user: 1,
  category: 1,
  startDate: 1
});

module.exports = mongoose.model('Budget', BudgetSchema);