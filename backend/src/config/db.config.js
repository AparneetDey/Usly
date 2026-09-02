import mongoose from 'mongoose';

/**
 * Connects to MongoDB using Mongoose.
 * Prevents server startup if connection fails by throwing an error.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const db_name = process.env.DB_NAME;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables.');
  }

  try {
    const conn = await mongoose.connect(`${mongoUri}/${db_name}`);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    throw error;
  }
};
