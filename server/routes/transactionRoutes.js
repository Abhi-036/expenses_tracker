const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/auth');

const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCSV,
  resetDemoData,
} = require('../controllers/transactionController');

const router = express.Router();

router.use(protect);

const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Date must be valid'),
];

router.get('/', getTransactions);
router.get('/export/csv', exportTransactionsCSV);
router.delete('/demo/reset', resetDemoData);
router.get('/:id', getTransaction);
router.post('/', transactionValidation, createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;