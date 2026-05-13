const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const employeeRoutes = require('./routes/employeeRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const errorHandler = require('./middleware/errorHandler');
const sanitize = require('./middleware/sanitize');

const app = express();

// Trust proxy header if running behind reverse proxies
app.set('trust proxy', 1);

// Configure Global Rate Limiter (Bypassed during automated unit/integration suites)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      type: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Dynamically reflect request origin to natively unblock deployed Vercel previews and trailing slash variances
    callback(null, true);
  },
  credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: '10kb' })); // Enforce strict JSON body size restrictions
app.use(sanitize);

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/insights', insightsRoutes);

// Handle 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      type: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
