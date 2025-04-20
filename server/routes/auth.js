const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Register route with validation
router.post(
  '/register', 
  [
    // Input validation
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').not().isEmpty().withMessage('Phone number is required'),
    body('role').isIn(['user', 'guardian', 'responder', 'admin']).withMessage('Invalid role')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Registration validation failed:', errors.array());
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }
      
      console.log('Register attempt with data:', {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        phone: req.body.phone
      });
      
      const { name, email, password, phone, role } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        console.log('Registration failed: User already exists with email:', email);
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      try {
        // Create new user
        user = new User({
          name,
          email,
          password, // Will be hashed by pre-save hook
          phone,
          role: role || 'user' // Default to user role if not specified
        });
        
        await user.save();
        console.log('User created successfully:', {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        });

        // Generate token for the new user
        const token = await user.generateAuthToken();
        console.log('Token generated for new user:', token.substring(0, 10) + '...');

        // Return the user and token
        res.status(201).json({
          message: 'Registration successful',
          user,
          token
        });
      } catch (saveError) {
        console.error('Error saving user to database:', saveError);
        return res.status(500).json({ message: 'Failed to create user in database' });
      }
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login route with validation
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').not().isEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Login validation failed:', errors.array());
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }
      
      console.log('Login attempt for:', req.body.email);
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log('Login failed: User not found with email:', email);
        return res.status(401).json({ message: 'Invalid login credentials' });
      }

      console.log('User found with ID:', user._id);

      // Use the comparePassword method from the User model
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Login failed: Password does not match for user:', email);
        return res.status(401).json({ message: 'Invalid login credentials' });
      }

      // Generate authentication token
      const token = await user.generateAuthToken();
      console.log('Login successful, generated token:', token.substring(0, 10) + '...');
      console.log('User role:', user.role);
      
      // Return the user and token
      res.json({ 
        message: 'Login successful',
        user, 
        token 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
});

// Logout route
router.post('/logout', auth, async (req, res) => {
  try {
    // Remove the current token
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

// Logout from all devices
router.post('/logout-all', auth, async (req, res) => {
  try {
    // Clear all tokens
    req.user.tokens = [];
    await req.user.save();
    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ message: 'Error logging out from all devices' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Update user profile
router.patch(
  '/me', 
  auth,
  [
    body('name').optional().trim().not().isEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('phone').optional().not().isEmpty().withMessage('Phone number cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const updates = req.body;
      const allowedUpdates = ['name', 'email', 'phone'];
      
      // Filter out non-allowed updates
      const validUpdates = Object.keys(updates)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});
      
      if (Object.keys(validUpdates).length === 0) {
        return res.status(400).json({ message: 'No valid updates provided' });
      }
      
      // Check if email is being updated and already exists
      if (validUpdates.email && validUpdates.email !== req.user.email) {
        const existingUser = await User.findOne({ email: validUpdates.email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      
      // Update user fields
      Object.assign(req.user, validUpdates);
      await req.user.save();
      
      res.json({ 
        message: 'Profile updated successfully',
        user: req.user 
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
});

// Forgot password route
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors.array() 
        });
      }
      
      const { email } = req.body;
      
      // Find user
      const user = await User.findOne({ email });
      
      // If user doesn't exist, return generic message but with error flag
      if (!user) {
        console.log('Forgot password request for non-existent user:', email);
        return res.status(404).json({ 
          success: false,
          message: 'No account found with this email address' 
        });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = Date.now() + 3600000; // Token expires in 1 hour
      
      // Store reset token and expiry in user document
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = tokenExpires;
      await user.save();
      
      console.log('Reset token generated for user:', email);
      
      // Build the reset link for frontend display
      // Get origin from headers or use default fallback
      let origin = req.headers.origin;
      if (!origin) {
        // Use default fallback based on client app port
        origin = 'http://localhost:3000';
        console.log('No origin found in headers, using default fallback:', origin);
      }
      
      console.log('Request headers:', req.headers);
      console.log('Using origin:', origin);
      
      // Generate THREE different formats of links to ensure one works
      // Format 1: HashRouter format (most compatible)
      const hashRouterLink = `${origin}/#/reset-password/${resetToken}`;
      
      // Format 2: Traditional query parameter
      const queryParamLink = `${origin}/reset-password?token=${resetToken}`;
      
      // Format 3: Direct path parameter (requires server-side handling)
      const pathParamLink = `${origin}/reset-password/${resetToken}`;
      
      console.log('Generated reset links:');
      console.log('- Hash Router Link:', hashRouterLink);
      console.log('- Query Param Link:', queryParamLink);
      console.log('- Path Param Link:', pathParamLink);
      
      // Send email with reset link
      const emailService = require('../utils/emailService');
      const emailSent = await emailService.sendPasswordResetEmail(email, hashRouterLink);
      
      if (!emailSent) {
        console.error('Failed to send reset email to:', email);
        return res.status(500).json({
          success: false, 
          message: 'Failed to send password reset email. Please try again later.'
        });
      }
      
      console.log('Reset email sent successfully to:', email);
      
      // Check if in development mode and add the indication
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        console.log('DEVELOPMENT MODE: Link will be displayed in the frontend for testing');
      }
      
      // Always return the reset token and all link variants in the response
      res.json({ 
        success: true,
        message: 'Password reset link generated successfully',
        resetToken: resetToken,
        resetLink: hashRouterLink, // Primary link (most compatible)
        alternateLinks: {
          hashLink: hashRouterLink,
          queryLink: queryParamLink,
          pathLink: pathParamLink
        },
        expiresAt: new Date(tokenExpires).toISOString()
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error during password reset request' 
      });
    }
});

// Verify reset token route
router.post(
  '/verify-reset-token',
  [
    body('token').not().isEmpty().withMessage('Reset token is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors.array() 
        });
      }
      
      const { token } = req.body;
      
      console.log('Verifying reset token:', token);
      
      // Find user with this reset token
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() } // Token must not be expired
      });
      
      if (!user) {
        console.log('Invalid or expired token:', token);
        return res.json({ 
          valid: false,
          message: 'Password reset token is invalid or has expired'
        });
      }
      
      // Token is valid
      console.log('Token is valid for user:', user.email);
      res.json({ 
        valid: true,
        message: 'Token is valid',
        email: user.email.substring(0, 3) + '***' + user.email.substring(user.email.indexOf('@'))
      });
    } catch (error) {
      console.error('Verify reset token error:', error);
      res.status(500).json({ 
        valid: false,
        message: 'Server error during token verification' 
      });
    }
});

// Reset password route
router.post(
  '/reset-password',
  [
    body('token').not().isEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors.array() 
        });
      }
      
      const { token, password } = req.body;
      
      console.log('Resetting password with token, first 10 chars:', token.substring(0, 10));
      
      // Find user with this reset token
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() } // Token must not be expired
      });
      
      if (!user) {
        console.log('Reset password failed: Invalid or expired token');
        return res.status(400).json({ 
          success: false,
          message: 'Password reset token is invalid or has expired' 
        });
      }
      
      // Update password and clear reset token
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      await user.save();
      
      console.log('Password reset successfully for user:', user.email);
      
      res.json({ 
        success: true,
        message: 'Password has been reset successfully' 
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error during password reset' 
      });
    }
});

module.exports = router; 