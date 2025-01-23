// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet'); // Security headers
const http = require('http'); // Needed for WebSocket
const WebSocket = require('ws'); // Real-time updates

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app); // Create HTTP server

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Broadcast stock updates to all clients
function broadcastStockUpdate(productId, newStock) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'stockUpdate',
        productId,
        stock: newStock
      }));
    }
  });
}

// Database connection with modern options
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// handle internal requests
app.use((req, res, next) => {
  req.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart')); 
app.use('/api/admin', require('./routes/admin'));

// Custom error class
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle specific error types
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.statusCode,
        message: err.message
      }
    });
  }

  // Generic server error
  res.status(500).json({
    error: {
      code: 500,
      message: 'Internal Server Error'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on port ${PORT}`);
});