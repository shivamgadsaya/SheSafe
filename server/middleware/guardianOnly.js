/**
 * Middleware to restrict access to guardian users only
 */
module.exports = function(req, res, next) {
  // Check if user exists and role is guardian
  if (!req.user || req.user.role !== 'guardian') {
    return res.status(403).json({ message: 'Access denied. Guardian privileges required.' });
  }
  
  next();
}; 