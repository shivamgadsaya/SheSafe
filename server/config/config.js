/**
 * Application Configuration
 * 
 * This file contains configuration settings for the application.
 * In a production environment, many of these would be set via environment variables.
 */

module.exports = {
  // Server settings
  port: process.env.PORT || 5000,
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // Email settings
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || 'support@shesafe.com',
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || '"SheSafe Support" <support@shesafe.com>'
  },
  
  // Client URL (for building links)
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Database settings
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shesafe'
  }
}; 