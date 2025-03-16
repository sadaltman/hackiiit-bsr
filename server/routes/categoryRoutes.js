const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  initCategories,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getCategories).post(protect, createCategory);
router.route('/:id').get(getCategoryById);
router.post('/init', protect, initCategories);

module.exports = router; 