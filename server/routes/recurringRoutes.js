const express = require('express');
const protect = require('../middleware/auth');

const {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  processAllRecurring,
} = require('../controllers/recurringController');

const router = express.Router();

router.use(protect);

router.get('/', getRecurring);
router.post('/', createRecurring);
router.post('/process', processAllRecurring);
router.put('/:id', updateRecurring);
router.delete('/:id', deleteRecurring);

module.exports = router;