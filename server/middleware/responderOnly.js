/**
 * Middleware to restrict access to emergency responder users only
 */
module.exports = function(req, res, next) {
  // Check if user exists and role is responder
  if (!req.user || req.user.role !== 'responder') {
    return res.status(403).json({ message: 'Access denied. Emergency responder privileges required.' });
  }
  
  next();
}; 