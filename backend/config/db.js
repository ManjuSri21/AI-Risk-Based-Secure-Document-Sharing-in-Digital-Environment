
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is missing');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `[Database] MongoDB Connected: ${conn.connection.host}`
    );

    return conn;
  } catch (error) {
    console.error(
      `[Database Error] Connection Failed: ${error.message}`
    );

    // Stop startup if the database connection fails.
    throw error;
  }
};
