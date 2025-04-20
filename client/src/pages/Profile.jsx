import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, logout, api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    autoCall: false,
    autoMessage: false
  });
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [contacts, setContacts] = useState([]);

  // Function to refresh user data from the server
  const refreshUserData = async () => {
    try {
      const userResponse = await api.get('/api/auth/me');
      
      // Log the response to debug
      console.log('User data received:', userResponse.data);
      
      // Update the form data with the latest user info
      const updatedUser = userResponse.data;
      setFormData({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        autoCall: updatedUser.autoCall || false,
        autoMessage: updatedUser.autoMessage || false
      });
      
      // Update contacts separately
      if (updatedUser.emergencyContacts) {
        setContacts(updatedUser.emergencyContacts);
      }
      
      // Force a re-render to show updated emergency contacts
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      }
    }
  };

  // Load contacts initially
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('/api/users/contacts');
        console.log('Fetched contacts:', response.data);
        setContacts(response.data);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    };
    
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        autoCall: user.autoCall || false,
        autoMessage: user.autoMessage || false
      });
      
      // Set contacts if they exist in the user object
      if (user.emergencyContacts) {
        setContacts(user.emergencyContacts);
      } else {
        // Otherwise fetch them separately
        fetchContacts();
      }
    }
  }, [user, refreshTrigger, api]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Updating profile with data:', formData);
      const response = await api.put('/api/users/profile', formData);
      console.log('Profile update response:', response.data);
      setSuccess('Profile updated successfully');
      refreshUserData();
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response) {
        console.log('Error response:', err.response.data);
        setError(err.response.data.message || 'Failed to update profile');
      } else if (err.request) {
        console.log('Error request:', err.request);
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Adding contact with data:', newContact);
      const response = await api.post('/api/users/contacts', newContact);
      console.log('Add contact response:', response.data);
      setNewContact({
        name: '',
        phone: '',
        relationship: ''
      });
      setSuccess('Emergency contact added successfully');
      
      // Update contacts immediately
      if (response.data.contact) {
        setContacts(prevContacts => [...prevContacts, response.data.contact]);
      }
      
      // Then refresh all user data
      refreshUserData();
    } catch (err) {
      console.error('Add contact error:', err);
      if (err.response) {
        console.log('Error response:', err.response.data);
        setError(err.response.data.message || 'Failed to add emergency contact');
      } else if (err.request) {
        console.log('Error request:', err.request);
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to add emergency contact');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContact = async (contactId) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/api/users/contacts/${contactId}`);
      setSuccess('Emergency contact removed successfully');
      
      // Update contacts immediately without waiting for refresh
      setContacts(prevContacts => prevContacts.filter(contact => contact._id !== contactId));
      
      // Then refresh all user data
      refreshUserData();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to remove emergency contact');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg">
              {success}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="autoCall"
                    checked={formData.autoCall}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Auto-call emergency contacts
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="autoMessage"
                    checked={formData.autoMessage}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Auto-message emergency contacts
                  </span>
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Emergency Contacts
            </h2>
            <form onSubmit={handleAddContact} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newContact.name}
                    onChange={handleContactChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newContact.phone}
                    onChange={handleContactChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="relationship"
                    value={newContact.relationship}
                    onChange={handleContactChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                Add Contact
              </button>
            </form>

            <div className="space-y-4">
              {contacts && contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contact.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {contact.phone}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contact.relationship}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveContact(contact._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No emergency contacts added yet.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 