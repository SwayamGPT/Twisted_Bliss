import mongoose from 'mongoose';

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI or MONGO_URI environment variable is required');
  }

  connectionPromise = (async () => {
    try {
      console.log('Buyer Backend: Attempting to connect to MongoDB...');
      
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, 
        dbName: process.env.MONGO_DB_NAME || 'twisted_bliss',
      });
      isConnected = true;
      console.log('Buyer Backend: Successfully connected to MongoDB');
    } catch (error) {
      console.error('Buyer Backend: MongoDB connection error:', error);
      isConnected = false;
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
};
