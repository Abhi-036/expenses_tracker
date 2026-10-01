const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/auth');

const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');

const router = express.Router();

router.use(protect);

const budgetValidation = [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('limit').isFloat({ gt: 0 }).withMessage('Limit must be greater than 0'),
  body('startDate').isISO8601().withMessage('Start date must be valid'),
];

router.get('/', getBudgets);
router.get('/:id', getBudget);
router.post('/', budgetValidation, createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;