require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/User');

async function testConnection() {
  try {
    // Create in-memory MongoDB server
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    console.log('MongoDB URI:', mongoUri);
    
    // Connect to the database
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890',
      role: 'user'
    });
    
    // Save the user
    await testUser.save();
    console.log('Test user created:', testUser._id);
    
    // Generate a token
    const token = await testUser.generateAuthToken();
    console.log('Token generated:', token);
    
    // Find the user again
    const foundUser = await User.findOne({ email: 'test@example.com' });
    console.log('Found user:', foundUser._id);
    
    // Verify token in user document
    console.log('User tokens:', foundUser.tokens);
    
    // Close connections
    await mongoose.disconnect();
    await mongoServer.stop();
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection(); 