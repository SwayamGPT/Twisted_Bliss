import mongoose from 'mongoose';

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

export const connectDB = async () => {
  // Check if we already have a connection (readyState: 1 = connected, 2 = connecting)
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  if (connectionPromise) {
    // If we're already connecting, wait for that promise
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  connectionPromise = (async () => {
    try {
      console.log('Attempting to connect to MongoDB...');
      if (mongoose.connection.listeners('connected').length === 0) {
        mongoose.connection.on('connected', () => {
          console.log('Mongoose connected to DB');
          isConnected = true;
        });
        mongoose.connection.on('error', (err) => {
          console.error('Mongoose connection error:', err);
          isConnected = false;
        });
        mongoose.connection.on('disconnected', () => {
          console.log('Mongoose disconnected');
          isConnected = false;
          connectionPromise = null;
        });
      }

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, 
        dbName: 'twisted_bliss',
      });
      isConnected = true;
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      isConnected = false;
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
};
