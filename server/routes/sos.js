const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { adminAuth } = require('../middlewares/adminAuth');
const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');

/**
 * @route   POST /api/sos
 * @desc    Create a new SOS alert
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { location, description } = req.body;
    
    // Check if user already has an active alert
    const existingAlert = await SOSAlert.findOne({
      user: req.user.id,
      status: 'active'
    });
    
    if (existingAlert) {
      return res.status(400).json({ 
        message: 'You already have an active SOS alert',
        alert: existingAlert
      });
    }
    
    // Create new SOS alert
    const sosAlert = new SOSAlert({
      user: req.user.id,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      description,
      status: 'active'
    });
    
    await sosAlert.save();
    
    // Get user to access emergency contacts
    const user = await User.findById(req.user.id).populate('emergencyContacts');
    
    // Mark emergency contacts as notified
    if (user.emergencyContacts && user.emergencyContacts.length > 0) {
      sosAlert.guardiansNotified = true;
      await sosAlert.save();
      
      // In a real app, this would trigger SMS/calls to emergency contacts
      console.log(`Emergency contacts notified for user ${user.name}`);
    }
    
    // Emit socket event in a real implementation
    // io.emit('sos-alert', { 
    //   alertId: sosAlert._id,
    //   userId: req.user.id,
    //   location: sosAlert.location,
    //   timestamp: sosAlert.createdAt
    // });
    
    res.status(201).json({
      success: true,
      alertId: sosAlert._id,
      message: 'SOS alert created successfully',
      notifiedContacts: user.emergencyContacts?.length || 0
    });
  } catch (err) {
    console.error('Error creating SOS alert:', err);
    res.status(500).json({ message: 'Server error creating SOS alert' });
  }
});

/**
 * @route   POST /api/sos/cancel
 * @desc    Cancel an active SOS alert
 * @access  Private
 */
router.post('/cancel', auth, async (req, res) => {
  try {
    // Find the most recent active alert for this user
    const sosAlert = await SOSAlert.findOneAndUpdate(
      { 
        user: req.user.id, 
        status: 'active' 
      },
      { 
        status: 'cancelled',
        resolvedAt: Date.now()
      },
      { new: true }
    );
    
    if (!sosAlert) {
      return res.status(404).json({ message: 'No active SOS alert found' });
    }
    
    // In a real app, this would send notifications to emergency contacts
    // that the emergency is cancelled
    
    res.json({
      success: true,
      message: 'SOS alert cancelled successfully'
    });
  } catch (err) {
    console.error('Error cancelling SOS alert:', err);
    res.status(500).json({ message: 'Server error cancelling SOS alert' });
  }
});

/**
 * @route   GET /api/sos/active
 * @desc    Get user's active SOS alert if exists
 * @access  Private
 */
router.get('/active', auth, async (req, res) => {
  try {
    const sosAlert = await SOSAlert.findOne({
      user: req.user.id,
      status: { $in: ['active', 'en_route', 'on_scene'] }
    }).populate('responders', 'name role');
    
    if (!sosAlert) {
      return res.json({ active: false });
    }
    
    res.json({
      active: true,
      alert: sosAlert
    });
  } catch (err) {
    console.error('Error fetching active SOS alert:', err);
    res.status(500).json({ message: 'Server error fetching active SOS alert' });
  }
});

/**
 * @route   GET /api/sos/history
 * @desc    Get user's SOS alert history
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const sosAlerts = await SOSAlert.find({ user: req.user.id })
      .populate('responders', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(sosAlerts);
  } catch (err) {
    console.error('Error fetching SOS history:', err);
    res.status(500).json({ message: 'Server error fetching SOS history' });
  }
});

/**
 * @route   PUT /api/sos/:id/description
 * @desc    Update the description of an SOS alert
 * @access  Private
 */
router.put('/:id/description', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    // Find the alert and ensure it belongs to this user
    const sosAlert = await SOSAlert.findOne({
      _id: id,
      user: req.user.id
    });
    
    if (!sosAlert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }
    
    sosAlert.description = description;
    await sosAlert.save();
    
    res.json({
      success: true,
      message: 'Description updated successfully'
    });
  } catch (err) {
    console.error('Error updating SOS description:', err);
    res.status(500).json({ message: 'Server error updating SOS description' });
  }
});

/**
 * @route   POST /api/sos/:id/location
 * @desc    Update location for an active SOS alert
 * @access  Private
 */
router.post('/:id/location', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;
    
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Valid location data is required' });
    }
    
    // Find the alert and ensure it belongs to this user
    const sosAlert = await SOSAlert.findOne({
      $or: [
        { _id: id, user: req.user.id },
        { alertId: id, user: req.user.id }
      ],
      status: { $in: ['active', 'en_route', 'on_scene'] }
    });
    
    if (!sosAlert) {
      return res.status(404).json({ message: 'Active SOS alert not found' });
    }
    
    // Update location
    sosAlert.location = {
      type: 'Point',
      coordinates: [location.longitude, location.latitude]
    };
    
    // Add to location history if it doesn't exist already
    if (!sosAlert.locationHistory) {
      sosAlert.locationHistory = [];
    }
    
    // Add new location to history
    sosAlert.locationHistory.push({
      coordinates: [location.longitude, location.latitude],
      accuracy: location.accuracy || 0,
      timestamp: new Date()
    });
    
    await sosAlert.save();
    
    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (err) {
    console.error('Error updating SOS location:', err);
    res.status(500).json({ message: 'Server error updating location' });
  }
});

/**
 * @route   GET /api/sos/admin/alerts
 * @desc    Get all SOS alerts for admin dashboard
 * @access  Admin only
 */
router.get('/admin/alerts', adminAuth, async (req, res) => {
  try {
    // Get all alerts, sorted by status (active first) and creation date (newest first)
    const alerts = await SOSAlert.find({})
      .populate('user', 'name email phone')
      .sort({ 
        status: 1, // Sort by status (active first)
        createdAt: -1 // Then by date (newest first)
      });
    
    // Separate into active and historical alerts
    const activeAlerts = alerts.filter(alert => 
      ['active', 'en_route', 'on_scene'].includes(alert.status)
    );
    
    const historicalAlerts = alerts.filter(alert => 
      ['resolved', 'cancelled'].includes(alert.status)
    );
    
    res.json({
      activeAlerts,
      historicalAlerts,
      totalActive: activeAlerts.length,
      totalHistorical: historicalAlerts.length
    });
  } catch (err) {
    console.error('Error fetching admin SOS alerts:', err);
    res.status(500).json({ message: 'Server error fetching SOS alerts' });
  }
});

/**
 * @route   PUT /api/sos/admin/:id/status
 * @desc    Update SOS alert status (admin only)
 * @access  Admin only
 */
router.put('/admin/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['active', 'en_route', 'on_scene', 'resolved', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Find and update the alert
    const alert = await SOSAlert.findById(id);
    
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }
    
    // Update status
    alert.status = status;
    
    // If resolving or cancelling, set resolvedAt timestamp
    if (['resolved', 'cancelled'].includes(status)) {
      alert.resolvedAt = Date.now();
    }
    
    await alert.save();
    
    res.json({
      success: true,
      message: `SOS alert status updated to ${status}`,
      alert
    });
  } catch (err) {
    console.error('Error updating SOS alert status:', err);
    res.status(500).json({ message: 'Server error updating SOS alert status' });
  }
});

module.exports = router; 