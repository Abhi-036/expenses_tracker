const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// @desc    Get all categories for the logged-in user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;

    const query = {
      user: req.user._id
    };

    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query)
      .sort({ name: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Create a custom category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const {
      name,
      type,
      color,
      icon
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      type,
      color,
      icon
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Default categories cannot be edited'
      });
    }

    const {
      name,
      color,
      icon
    } = req.body;

    if (name !== undefined) {
      category.name = name;
    }

    if (color !== undefined) {
      category.color = color;
    }

    if (icon !== undefined) {
      category.icon = icon;
    }

    await category.save();

    res.json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Delete a custom category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Default categories cannot be deleted'
      });
    }

    const inUse = await Transaction.countDocuments({
      user: req.user._id,
      category: category.name
    });

    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${inUse} transaction(s) use this category`
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};