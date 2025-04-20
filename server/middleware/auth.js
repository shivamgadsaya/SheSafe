const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and set authenticated user on request
 */
module.exports = async function(req, res, next) {
  try {
    console.log('Auth middleware called');
    
    // Check for token in various formats
    let token = null;
    
    // First check x-auth-token header
    token = req.header('x-auth-token');
    
    // If no token, check Authorization header (Bearer token)
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (authHeader) {
        token = authHeader;
      }
    }

    // Check if no token found in any format
    if (!token) {
      console.log('No token found in request headers');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    console.log('Token found:', token.substring(0, 10) + '...');

    // Set secret with fallback
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';

    // Verify token
    try {
      const decoded = jwt.verify(token, secret);
      
      // JWT verification verifies _id field but findById expects id field
      const userId = decoded._id || decoded.id;
      console.log('Token verified for user ID:', userId);
      
      // Find user 
      const user = await User.findById(userId);
      
      if (!user) {
        console.log('User not found in database with ID:', userId);
        return res.status(401).json({ message: 'User not found' });
      }
      
      // In development mode, don't strictly validate token in user's tokens array
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode - accepting valid JWT regardless of user tokens');
      }
      
      // Set user and token on request object
      req.user = user;
      req.token = token;
      
      console.log('Authentication successful for user:', user.name);
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        console.log('Token expired');
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      } else {
        console.error('JWT verification error:', jwtError);
        return res.status(401).json({ message: 'Invalid token. Please log in again.' });
      }
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};
