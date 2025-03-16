const mongoose = require('mongoose');

// MongoDB URI
const MONGO_URI = 'mongodb+srv://chokshisahaj:madarchod@exp.c73mh.mongodb.net/college-marketplace?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  // Define Category model
  const categorySchema = mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

  const Category = mongoose.model('Category', categorySchema);

  // Categories to add
  const categoriesToAdd = [
    'Food',
    'Grocery items',
    'Devices',
    'Clothes',
    'Misc'
  ];

  // Category to remove
  const categoriesToRemove = [
    'Food and grocery items',
    'Clothing'
  ];

  try {
    // First remove categories that need to be replaced
    for (const name of categoriesToRemove) {
      const result = await Category.deleteOne({ name });
      if (result.deletedCount > 0) {
        console.log(`Removed category: ${name}`);
      } else {
        console.log(`Category not found for removal: ${name}`);
      }
    }

    // Then add new categories
    for (const name of categoriesToAdd) {
      const categoryExists = await Category.findOne({ name });

      if (!categoryExists) {
        const category = await Category.create({ name });
        console.log(`Added category: ${name}`);
      } else {
        console.log(`Category already exists: ${name}`);
      }
    }
    
    console.log('All categories updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
}); 