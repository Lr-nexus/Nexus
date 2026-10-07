const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in backend/.env');
    }

    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    return conn;
  } catch (e) {
    console.error('❌ MongoDB connection failed:', e.message);
    process.exit(1);
  }
};