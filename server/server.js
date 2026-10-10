require('dotenv').config();
if (process.env.DNS_SERVERS) {
  require('dns').setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
}
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


const express = require('express');
const cors = require('cors');

const app = express();

// PASTE CORS HERE — before your API routes
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://expensestracker-three-sooty.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Your existing routes should remain below
// app.use('/api/auth', authRoutes);

app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  // Safe diagnostics: shows whether settings exist, never their values.
  const generateToken = require('./utils/generateToken');
  let jwtConfigOk = true;
  try {
    generateToken.assertConfig();
  } catch (e) {
    jwtConfigOk = false;
  }

  res.json({
    success: true,
    message: 'API is running',
    version: 'auth-hardening-2',
    config: {
      mongoUriSet: Boolean(String(process.env.MONGO_URI || '').trim()),
      jwtSecretSet: Boolean(String(process.env.JWT_SECRET || '').trim()),
      jwtExpiresInRaw: process.env.JWT_EXPIRES_IN === undefined ? null : JSON.stringify(process.env.JWT_EXPIRES_IN),
      jwtExpiresInUsed: generateToken.getExpiresIn(),
      jwtConfigOk,
    },
    timestamp: new Date().toISOString(),
  });
});

// Vercel loads the exported Express app instead of running `node server.js`.
// Connect lazily on API requests so local startup remains unchanged and the
// MongoDB connection is reused across warm serverless invocations.
if (process.env.NODE_ENV !== 'test') {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      next(error);
    }
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recurring-transactions', recurringRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error.message);
      process.exit(1);
    });
}

module.exports = app;
