const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },
    color: {
      type: String,
      default: '#a13d5f'
    },
    icon: {
      type: String,
      default: 'tag'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

CategorySchema.index(
  { user: 1, name: 1, type: 1 },
  { unique: true }
);

module.exports = mongoose.model('Category', CategorySchema);