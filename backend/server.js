require('dotenv').config();
const express = require('express');
const pinoHttp = require('pino-http');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const noteRoutes = require('./src/routes/noteRoutes');

// Initialize database connection
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP Request/Response Logging using Pino
app.use(pinoHttp({ logger }));

// Basic Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Notes App Backend API is running...' });
});
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Test route to verify the global exception handler works
app.get('/error-test', (req, res) => {
  throw new Error('This is a simulated error to test global exception handling.');
});

// Global Error Handler (MUST be the last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

module.exports = app;