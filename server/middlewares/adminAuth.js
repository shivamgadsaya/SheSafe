const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify admin access rights
 * This middleware enforces that the user is both authenticated and has the admin role
 */
exports.adminAuth = async function(req, res, next) {
  try {
    console.log('Admin auth middleware called');
    
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
      
      // Check for admin role
      if (user.role !== 'admin') {
        console.log('Access denied - user is not an admin:', user.name, user.role);
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      // Set user and token on request object
      req.user = user;
      req.token = token;
      
      console.log('Admin authentication successful for user:', user.name);
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
    console.error('Admin auth middleware error:', err);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
}; 