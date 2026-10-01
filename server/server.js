require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/*
 * Health check
 * This endpoint does not require MongoDB.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

/*
 * Connect MongoDB before database-dependent API routes.
 * db.js already caches the connection for Vercel.
 */
if (process.env.NODE_ENV !== 'test') {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);

      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error:
          process.env.NODE_ENV === 'production'
            ? 'Unable to connect to database'
            : error.message,
      });
    }
  });
}

/*
 * API routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recurring-transactions', recurringRoutes);
app.use('/api/reports', reportRoutes);

/*
 * Unknown route
 */
app.use(notFound);

/*
 * Global error handler
 */
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/*
 * Local development only.
 * Vercel imports `app` directly.
 */
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Server running in ${
            process.env.NODE_ENV || 'development'
          } mode on port ${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error.message);
      process.exit(1);
    });
}

module.exports = app;
