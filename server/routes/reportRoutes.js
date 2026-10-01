const express = require('express');
const protect = require('../middleware/auth');

const {
  getDashboardSummary,
  getMonthlyReport
} = require('../controllers/reportController');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/monthly', getMonthlyReport);

module.exports = router;
