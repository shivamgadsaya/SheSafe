const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const User = require('../models/User');

// Get all emergency contacts for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.emergencyContacts || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new emergency contact
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }
    
    const user = await User.findById(req.user._id);
    
    user.emergencyContacts.push({
      name,
      phone,
      relationship
    });
    
    await user.save();
    res.status(201).json(user.emergencyContacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an emergency contact
router.delete('/:contactId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.emergencyContacts = user.emergencyContacts.filter(
      contact => contact._id.toString() !== req.params.contactId
    );
    
    await user.save();
    res.json({ message: 'Contact removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an emergency contact
router.put('/:contactId', auth, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;
    const user = await User.findById(req.user._id);
    
    const contactIndex = user.emergencyContacts.findIndex(
      contact => contact._id.toString() === req.params.contactId
    );
    
    if (contactIndex === -1) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    if (name) user.emergencyContacts[contactIndex].name = name;
    if (phone) user.emergencyContacts[contactIndex].phone = phone;
    if (relationship) user.emergencyContacts[contactIndex].relationship = relationship;
    
    await user.save();
    res.json(user.emergencyContacts[contactIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 