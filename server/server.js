require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'X-Requested-With']
}));
app.use(express.json());
app.use(morgan('dev'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));
app.use('/api/guardians', require('./routes/guardians'));
app.use('/api/responders', require('./routes/responders'));

// Add a simple health check endpoint to check server status
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// If we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
} else {
  // In development, support both API calls and client-side routing
  // This ensures reset-password routes work correctly
  app.get('/reset-password/*', (req, res) => {
    // For development, you can redirect to your client dev server
    res.redirect(`http://localhost:3000${req.originalUrl}`);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
async function startServer() {
  try {
    let mongoUri;
    let mongoServerInstance = null;

    // Use real MongoDB if MONGODB_URI is specified, otherwise use in-memory
    if (process.env.USE_REAL_DB === 'true' && process.env.MONGODB_URI) {
      mongoUri = process.env.MONGODB_URI;
      console.log('Using real MongoDB database');
    } else {
      // Create an in-memory MongoDB instance
      mongoServerInstance = await MongoMemoryServer.create();
      mongoUri = mongoServerInstance.getUri();
      console.log('Using in-memory MongoDB database (data will be lost on restart)');
    }
    
    // Connect to the database
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at:', mongoUri);
    
    // Create test users
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    // Function to create a user if they don't exist
    async function createUserIfNotExists(userData) {
      try {
        let existingUser = await User.findOne({ email: userData.email });
        
        if (!existingUser) {
          // Hash the password manually to ensure it's stored correctly
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(userData.password, salt);
          
          // Create new user with hashed password
          const newUser = new User({
            ...userData,
            password: hashedPassword
          });
          
          await newUser.save();
          console.log(`Test ${userData.role} created with email: ${userData.email} and password: ${userData.password}`);
          return true;
        } else {
          console.log(`Test ${userData.role || 'user'} already exists with email: ${userData.email}`);
          return false;
        }
      } catch (error) {
        console.error(`Error creating test ${userData.role || 'user'}:`, error);
        return false;
      }
    }
    
    // Create test users for each role
    await createUserIfNotExists({
      name: 'Test User',
      email: 'user@shesafe.com',
      password: 'user123',
      phone: '1234567890',
      role: 'user'
    });
    
    await createUserIfNotExists({
      name: 'Test Guardian',
      email: 'guardian@shesafe.com',
      password: 'guardian123',
      phone: '1234567891',
      role: 'guardian'
    });
    
    await createUserIfNotExists({
      name: 'Test Responder',
      email: 'responder@shesafe.com',
      password: 'responder123',
      phone: '1234567892',
      role: 'responder'
    });
    
    // Create admin user
    await createUserIfNotExists({
      name: 'Admin User',
      email: 'admin@shesafe.com',
      password: 'admin123',
      phone: '1234567893',
      role: 'admin'
    });
    
    // Start server
    const PORT = process.env.PORT || 5003;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Test accounts:');
      console.log(`- User: user@shesafe.com / user123`);
      console.log(`- Guardian: guardian@shesafe.com / guardian123`);
      console.log(`- Responder: responder@shesafe.com / responder123`);
      console.log(`- Admin: admin@shesafe.com / admin123`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

// Handle server shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

startServer(); 