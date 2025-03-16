const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort('name');
  res.json(categories);
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please add a category name');
  }

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error('Invalid category data');
  }
});

// @desc    Initialize default categories
// @route   POST /api/categories/init
// @access  Private/Admin
const initCategories = asyncHandler(async (req, res) => {
  const defaultCategories = [
    'Textbooks',
    'Electronics',
    'Devices',
    'Furniture',
    'Clothes',
    'Mess Meals',
    'Food',
    'Grocery items',
    'Services',
    'Housing/Rentals',
    'Transportation',
    'Misc',
    'Other',
  ];

  const createdCategories = [];

  for (const name of defaultCategories) {
    const categoryExists = await Category.findOne({ name });

    if (!categoryExists) {
      const category = await Category.create({ name });
      createdCategories.push(category);
    }
  }

  res.status(201).json(createdCategories);
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  initCategories,
}; 