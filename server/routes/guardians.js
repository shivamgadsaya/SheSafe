const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SOSAlert = require('../models/SOSAlert');
const auth = require('../middleware/auth');
const guardianOnly = require('../middleware/guardianOnly');

// Apply both middleware for all guardian routes
router.use(auth, guardianOnly);

/**
 * @route   GET /api/guardians/dependents
 * @desc    Get all dependents for a guardian
 * @access  Private (Guardian only)
 */
router.get('/dependents', async (req, res) => {
  try {
    const guardianId = req.user.id;
    
    // Find all users who have this guardian in their guardians array
    const dependents = await User.find({ 
      guardians: guardianId,
      role: 'user'
    }).select('-password');
    
    res.json(dependents);
  } catch (err) {
    console.error('Error in GET /api/guardians/dependents:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/guardians/alerts
 * @desc    Get all active alerts for a guardian's dependents
 * @access  Private (Guardian only)
 */
router.get('/alerts', async (req, res) => {
  try {
    const guardianId = req.user.id;
    
    // Find all users who have this guardian in their guardians array
    const dependents = await User.find({ 
      guardians: guardianId,
      role: 'user'
    }).select('_id');
    
    const dependentIds = dependents.map(dependent => dependent._id);
    
    // Find all active alerts for these dependents
    const alerts = await SOSAlert.find({
      user: { $in: dependentIds },
      status: { $in: ['active', 'en_route', 'on_scene'] }
    }).populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (err) {
    console.error('Error in GET /api/guardians/alerts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/guardians/respond/:alertId
 * @desc    Mark guardian as responding to an alert
 * @access  Private (Guardian only)
 */
router.post('/respond/:alertId', async (req, res) => {
  try {
    const guardianId = req.user.id;
    const { alertId } = req.params;
    
    // Find the alert
    const alert = await SOSAlert.findById(alertId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check if the alert belongs to a dependent
    const user = await User.findById(alert.user);
    if (!user || !user.guardians.includes(guardianId)) {
      return res.status(403).json({ message: 'Not authorized to respond to this alert' });
    }
    
    // Add guardian to responders if not already added
    if (!alert.responders.includes(guardianId)) {
      alert.responders.push(guardianId);
      await alert.save();
    }
    
    res.json({ message: 'Response registered successfully' });
  } catch (err) {
    console.error('Error in POST /api/guardians/respond/:alertId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/guardians/resolve/:alertId
 * @desc    Resolve an alert (guardian only)
 * @access  Private (Guardian only)
 */
router.post('/resolve/:alertId', async (req, res) => {
  try {
    const guardianId = req.user.id;
    const { alertId } = req.params;
    const { notes } = req.body;
    
    // Find the alert
    const alert = await SOSAlert.findById(alertId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check if the alert belongs to a dependent
    const user = await User.findById(alert.user);
    if (!user || !user.guardians.includes(guardianId)) {
      return res.status(403).json({ message: 'Not authorized to resolve this alert' });
    }
    
    // Check if guardian is already responding
    if (!alert.responders.includes(guardianId)) {
      return res.status(400).json({ message: 'You must be responding to this alert to resolve it' });
    }
    
    // Update the alert status
    alert.status = 'resolved';
    alert.resolvedAt = Date.now();
    if (notes) {
      alert.notes = notes;
    }
    await alert.save();
    
    res.json({ message: 'Alert resolved successfully' });
  } catch (err) {
    console.error('Error in POST /api/guardians/resolve/:alertId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/guardians/add/:userId
 * @desc    Add a user as a dependent
 * @access  Private (Guardian only)
 */
router.post('/add/:userId', async (req, res) => {
  try {
    const guardianId = req.user.id;
    const { userId } = req.params;
    
    // Check if user exists and is a 'user' role
    const user = await User.findOne({ _id: userId, role: 'user' });
    if (!user) {
      return res.status(404).json({ message: 'User not found or not a valid user' });
    }
    
    // Add guardian to user's guardians array if not already added
    if (!user.guardians.includes(guardianId)) {
      user.guardians.push(guardianId);
      await user.save();
    }
    
    res.json({ message: 'User added as dependent successfully' });
  } catch (err) {
    console.error('Error in POST /api/guardians/add/:userId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/guardians/remove/:userId
 * @desc    Remove a user as a dependent
 * @access  Private (Guardian only)
 */
router.delete('/remove/:userId', async (req, res) => {
  try {
    const guardianId = req.user.id;
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove guardian from user's guardians array
    user.guardians = user.guardians.filter(g => g.toString() !== guardianId);
    await user.save();
    
    res.json({ message: 'User removed as dependent successfully' });
  } catch (err) {
    console.error('Error in DELETE /api/guardians/remove/:userId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 