const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const routes = require('./routes');
const errorHandler = require('./middleware/errorMiddleware');
const ApiError = require('./utils/apiError');

const app = express();

// Compress all responses
app.use(compression());

// Security Headers
app.use(helmet());

// CORS config
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vite default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};
app.use(cors(corsOptions));

// Parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Mount API routes
app.use('/api', routes);

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  setHeaders: (res, filePath, stat) => {
    res.set('Content-Disposition', 'attachment');
  }
}));

// Serve incident uploads (images/audio viewable inline)
app.use('/uploads/incidents', express.static(path.join(__dirname, '../uploads/incidents')));

// Handle unknown API requests
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server`));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
