const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    
    // Check for token in various formats
    // 1. Authorization header with Bearer prefix
    // 2. Authorization header without prefix
    // 3. x-auth-token header
    let token = null;
    
    // Check Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7, authHeader.length);
      } else {
        token = authHeader;
      }
    }
    
    // If no token in Authorization header, check x-auth-token
    if (!token) {
      token = req.header('x-auth-token');
    }

    // If still no token found
    if (!token) {
      console.log('No authentication token found in request');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    console.log('Token extracted:', token.substring(0, 15) + '...');

    // Special handling for debug-admin-token in development mode
    if (process.env.NODE_ENV !== 'production' && token === 'debug-admin-token') {
      console.log('Debug admin token detected - bypassing JWT verification');
      
      // Create a mock admin user
      const adminUser = {
        _id: 'admin-debug-id',
        id: 'admin-debug-id',
        name: 'Admin User',
        email: 'admin@shesafe.com',
        role: 'admin',
        isVerified: true
      };
      
      // Attach to request
      req.token = token;
      req.user = adminUser;
      return next();
    }

    try {
      // Verify the token with fallback secret for development
      const secret = process.env.JWT_SECRET || 'fallback-secret-key';
      const decoded = jwt.verify(token, secret);
      console.log('Token decoded successfully, user ID:', decoded._id);
      
      // Find the user - use decoded._id or decoded.id depending on how token was created
      const userId = decoded._id || decoded.id;
      const user = await User.findById(userId);
  
      if (!user) {
        console.log('User not found for ID:', userId);
        return res.status(401).json({ message: 'User not found - please log in again' });
      }
      
      // Debug log the user's token array
      console.log(`User has ${user.tokens ? user.tokens.length : 0} tokens saved`);
      
      // For better UX, we'll always accept valid JWT tokens in development
      // This allows login even after DB resets or token removal
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode - accepting valid JWT without token verification');
      } else {
        // In production, check if token is in the tokens array
        const tokenExists = user.tokens && user.tokens.some(t => t.token === token);
        if (!tokenExists) {
          console.log('Token not found in user tokens array');
          return res.status(401).json({ message: 'Session expired. Please log in again.' });
        }
      }
      
      console.log('User authenticated successfully:', user.name);
  
      // Attach the token and user to the request
      req.token = token;
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      // Provide specific error messages based on the JWT error type
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token. Please log in again.' });
      } else {
        return res.status(401).json({ message: 'Authentication failed. Please log in again.' });
      }
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { auth, roleAuth }; 