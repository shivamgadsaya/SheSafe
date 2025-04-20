const express = require('express');
const router = express.Router();
const SOSAlert = require('../models/SOSAlert');
const auth = require('../middleware/auth');
const responderOnly = require('../middleware/responderOnly');

// Apply both middleware for all responder routes
router.use(auth, responderOnly);

/**
 * @route   GET /api/responders/alerts/active
 * @desc    Get all active alerts in the area
 * @access  Private (Responder only)
 */
router.get('/alerts/active', async (req, res) => {
  try {
    // For now, just get all active alerts
    // In a real app, we would filter by location proximity to the responder
    const alerts = await SOSAlert.find({
      status: { $in: ['active', 'en_route', 'on_scene'] }
    }).populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (err) {
    console.error('Error in GET /api/responders/alerts/active:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/responders/alerts/past
 * @desc    Get past alerts that this responder was involved with
 * @access  Private (Responder only)
 */
router.get('/alerts/past', async (req, res) => {
  try {
    const responderId = req.user.id;
    
    // Find alerts where this responder is in the responders array
    const alerts = await SOSAlert.find({
      responders: responderId
    }).populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (err) {
    console.error('Error in GET /api/responders/alerts/past:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/responders/respond/:alertId
 * @desc    Mark responder as responding to an alert
 * @access  Private (Responder only)
 */
router.post('/respond/:alertId', async (req, res) => {
  try {
    const responderId = req.user.id;
    const { alertId } = req.params;
    
    // Find the alert
    const alert = await SOSAlert.findById(alertId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check if already responding
    if (alert.responders.includes(responderId)) {
      return res.status(400).json({ message: 'Already responding to this alert' });
    }
    
    // Add responder to responders array
    alert.responders.push(responderId);
    await alert.save();
    
    res.json({ message: 'Response registered successfully' });
  } catch (err) {
    console.error('Error in POST /api/responders/respond/:alertId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/responders/alerts/:alertId/status
 * @desc    Update the status of an alert
 * @access  Private (Responder only)
 */
router.put('/alerts/:alertId/status', async (req, res) => {
  try {
    const responderId = req.user.id;
    const { alertId } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    if (!['en_route', 'on_scene', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Find the alert
    const alert = await SOSAlert.findById(alertId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check if responder is responding to this alert
    if (!alert.responders.includes(responderId)) {
      return res.status(403).json({ message: 'Not authorized to update this alert' });
    }
    
    // Update the alert
    alert.status = status;
    if (notes) {
      alert.notes = notes;
    }
    
    // If resolved, set resolvedAt
    if (status === 'resolved') {
      alert.resolvedAt = Date.now();
    }
    
    await alert.save();
    
    res.json({ message: 'Alert status updated successfully' });
  } catch (err) {
    console.error('Error in PUT /api/responders/alerts/:alertId/status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/responders/alerts/:alertId
 * @desc    Get details of a specific alert
 * @access  Private (Responder only)
 */
router.get('/alerts/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    
    // Find the alert and populate user details
    const alert = await SOSAlert.findById(alertId)
      .populate('user', 'name email phone')
      .populate('responders', 'name role');
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (err) {
    console.error('Error in GET /api/responders/alerts/:alertId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 