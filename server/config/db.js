const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
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
