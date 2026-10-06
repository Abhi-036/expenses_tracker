const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

    const uri = String(process.env.MONGO_URI || '').trim().replace(/^["'`]+|["'`]+$/g, '').trim();

  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  connectionPromise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 8000 })
    .then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;
