const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGO_URI directly if provided, otherwise construct from individual parts
    let mongoURI = process.env.MONGO_URI;
    
    // If MONGO_URI contains <PASSWORD> placeholder, replace it with the actual password
    if (mongoURI && mongoURI.includes('<PASSWORD>')) {
      mongoURI = mongoURI.replace('<PASSWORD>', process.env.MONGODB_PASSWORD);
    } else if (!mongoURI) {
      // Fallback to constructing the URI from individual parts
      mongoURI = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`;
      
      // If username and password are provided, include them in the URI
      if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
        mongoURI = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`;
      }
    }
    
    console.log('Connecting to MongoDB with URI:', mongoURI.replace(/:[^:]*@/, ':****@')); // Hide password in logs
    
    try {
      const conn = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (atlasError) {
      console.error(`Error connecting to MongoDB Atlas: ${atlasError.message}`);
      console.log('Attempting to connect to local MongoDB instance...');
      
      // Try connecting to local MongoDB as fallback
      const localMongoURI = 'mongodb://localhost:27017/college-marketplace';
      const conn = await mongoose.connect(localMongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log(`Connected to local MongoDB: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Provide more specific error messages for common connection issues
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check your connection string and network connectivity.');
    } else if (error.name === 'MongoError' && error.code === 18) {
      console.error('Authentication failed. Please check your MongoDB username and password.');
    } else if (error.name === 'MongoError' && error.code === 13) {
      console.error('Authentication failed. The user does not have permission to access the database.');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB; 