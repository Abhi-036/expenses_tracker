const { validationResult } = require('express-validator');
const User = require('../models/User');
const Category = require('../models/Category');
const generateToken = require('../utils/generateToken');
const { DEFAULT_CATEGORIES } = require('../utils/seedData');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { name, email, password } = req.body;

    const existing = await User.findOne({
      email: email.toLowerCase()
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    // Seed default categories for the new user
    const categoryDocs = DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      user: user._id,
      isDefault: true
    }));

    await Category.insertMany(categoryDocs);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Login with email/password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Get the logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, currency, avatarColor } = req.body;

    if (name !== undefined) {
      req.user.name = name;
    }

    if (currency !== undefined) {
      req.user.currency = currency;
    }

    if (avatarColor !== undefined) {
      req.user.avatarColor = avatarColor;
    }

    await req.user.save();

    res.json({
      success: true,
      user: req.user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id)
      .select('+password');

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};