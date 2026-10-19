import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection Failed: ${error.message}`);
    console.log('[Database Notice] Please verify your MONGO_URI in backend/.env if MongoDB Atlas is not yet running.');
  }
};
