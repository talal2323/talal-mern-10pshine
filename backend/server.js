require('dotenv').config();
const express = require('express');
const pinoHttp = require('pino-http');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const noteRoutes = require('./src/routes/noteRoutes');

const http = require('http');
const { Server } = require('socket.io');
// Initialize database connection
connectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set('socketio', io);

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

io.on('connection', (socket) => {
  console.log(`🔌 New real-time connection established: ${socket.id}`);

  // We can listen for specific events from the frontend here later
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Test route to verify the global exception handler works
app.get('/error-test', (req, res) => {
  throw new Error('This is a simulated error to test global exception handling.');
});

// Global Error Handler (MUST be the last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

module.exports = app;