const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const User = require('../models/User');

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, autoCall, autoMessage } = req.body;
    
    // Find the user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (autoCall !== undefined) user.autoCall = autoCall;
    if (autoMessage !== undefined) user.autoMessage = autoMessage;
    
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Add emergency contact
router.post('/contacts', auth, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add new contact
    user.emergencyContacts.push({
      name,
      phone,
      relationship
    });
    
    await user.save();
    res.status(201).json(user.emergencyContacts);
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ message: 'Error adding contact' });
  }
});

// Delete emergency contact
router.delete('/contacts/:contactId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove the contact with the given ID
    user.emergencyContacts = user.emergencyContacts.filter(
      contact => contact._id.toString() !== req.params.contactId
    );
    
    await user.save();
    res.json({ message: 'Contact removed successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Error removing contact' });
  }
});

module.exports = router; 