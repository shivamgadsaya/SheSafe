const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const Report = require('../models/Report');

// Create report
router.post('/', auth, async (req, res) => {
  try {
    // Transform the address into a simple location object
    const reportData = { ...req.body };
    
    // For simplicity, use dummy coordinates if address is provided
    if (reportData.address) {
      reportData.location = {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates
      };
    }
    
    const report = new Report({
      ...reportData,
      user: req.user._id || req.user.id // Handle both ID formats
    });
    
    await report.save();
    
    // Log success for debugging
    console.log(`Report created by user ${req.user._id || req.user.id}: ${report.title}`);
    
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    
    // Return specific validation errors if available
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: 'Error creating report. Please try again.' });
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name');
    
    console.log(`Fetched ${reports.length} reports`);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Get user's reports
router.get('/my-reports', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id; // Handle both ID formats
    const reports = await Report.find({ user: userId })
      .sort({ createdAt: -1 });
    
    console.log(`Fetched ${reports.length} reports for user ${userId}`);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ message: 'Error fetching your reports' });
  }
});

// Update report status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if user has permission (either admin or report owner)
    const isAdmin = req.user.role === 'admin';
    const isOwner = report.user.toString() === (req.user._id || req.user.id).toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }
    
    report.status = req.body.status;
    await report.save();
    
    console.log(`Report ${report._id} status updated to ${req.body.status}`);
    res.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Error updating report' });
  }
});

// Get a single report by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if user has permission (either admin or report owner)
    const isAdmin = req.user.role === 'admin';
    const isOwner = report.user._id.toString() === (req.user._id || req.user.id).toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }
    
    console.log(`Report ${report._id} accessed by user ${req.user._id || req.user.id}`);
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
});

module.exports = router; 