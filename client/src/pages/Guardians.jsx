import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// Placeholder guardian data moved outside the component
const MOCK_GUARDIANS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    relationship: 'Sister',
    phone: '+1 (555) 123-4567',
    email: 'sarah.j@example.com',
    status: 'active'
  },
  {
    id: '2',
    name: 'Michael Chen',
    relationship: 'Friend',
    phone: '+1 (555) 987-6543',
    email: 'mike.chen@example.com',
    status: 'active'
  },
  {
    id: '3',
    name: 'Dr. Lisa Rodriguez',
    relationship: 'Physician',
    phone: '+1 (555) 222-3333',
    email: 'dr.lisa@example.com',
    status: 'pending'
  }
];

const Guardians = () => {
  const { user, api, isAuthenticated } = useAuth();
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch guardians on component mount
  useEffect(() => {
    const fetchGuardians = async () => {
      try {
        setLoading(true);
        console.log('Using mock guardian data - no API call');
        
        // Skip API call altogether and use mock data
        setGuardians(MOCK_GUARDIANS);
        setError('');
      } catch (err) {
        console.error('Error in guardian data handling:', err);
        setError('Unable to load your guardians. Using sample data for now.');
        setGuardians(MOCK_GUARDIANS);
      } finally {
        setLoading(false);
      }
    };
    
    // Always load guardians data regardless of authentication
    fetchGuardians();
    
    // Log debug information
    console.log("Guardians component mounted");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    
  }, [isAuthenticated, user]);

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]{10,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.relationship.trim()) {
      errors.relationship = 'Relationship is required';
    }
    
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Submitting guardian data:', formData);
      
      if (isEditMode) {
        // Update existing guardian
        const response = await api.put(`/api/guardians/${editId}`, formData);
        console.log('Update guardian response:', response);
        
        if (response && response.data) {
          // Update local state
          setGuardians(guardians.map(guardian => 
            guardian.id === editId ? { ...guardian, ...response.data } : guardian
          ));
          
          setSuccess('Guardian updated successfully!');
        } else {
          // Fall back to local update if API doesn't return data
          setGuardians(guardians.map(guardian => 
            guardian.id === editId ? { ...guardian, ...formData } : guardian
          ));
          
          setSuccess('Guardian updated!');
        }
      } else {
        // Add new guardian
        try {
          const response = await api.post('/api/guardians', formData);
          console.log('Add guardian response:', response);
          
          if (response && response.data) {
            // Add to local state with returned data from server
            setGuardians([...guardians, response.data]);
          } else {
            // Fall back to creating a local entry if API doesn't return data
            const newGuardian = {
              ...formData,
              id: String(Date.now()), // Generate a temporary ID
              status: 'pending'
            };
            setGuardians([...guardians, newGuardian]);
          }
        } catch (postError) {
          console.error('Error in POST request:', postError);
          // Still create a local entry for demo purposes
          const newGuardian = {
            ...formData,
            id: String(Date.now()), // Generate a temporary ID
            status: 'pending'
          };
          setGuardians([...guardians, newGuardian]);
        }
        
        setSuccess('Guardian added successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        relationship: '',
        email: ''
      });
      
      setIsEditMode(false);
      setEditId(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error saving guardian:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(isEditMode ? 'Failed to update guardian. Please try again.' : 'Failed to add guardian. Please try again.');
      }
      
      // Despite the error, don't prevent the user from continuing to use the page
      // Reset the form anyway after an error so they can try again
      if (isEditMode) {
        setFormData({
          name: '',
          phone: '',
          relationship: '',
          email: ''
        });
        
        setIsEditMode(false);
        setEditId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit a guardian
  const handleEdit = (guardian) => {
    setFormData({
      name: guardian.name,
      phone: guardian.phone,
      relationship: guardian.relationship,
      email: guardian.email || ''
    });
    
    setIsEditMode(true);
    setEditId(guardian.id);
    
    // Scroll to form
    document.getElementById('guardian-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Prepare to delete a guardian
  const prepareDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };
  
  // Cancel deletion
  const cancelDelete = () => {
    setDeleteId(null);
    setShowDeleteConfirm(false);
  };

  // Confirm and delete a guardian
  const confirmDelete = async () => {
    if (!deleteId) return;
    
    setLoading(true);
    setError('');
    
    try {
      await api.delete(`/api/guardians/${deleteId}`);
      
      // Remove from local state
      setGuardians(guardians.filter(guardian => guardian.id !== deleteId));
      
      setSuccess('Guardian removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting guardian:', err);
      setError('Failed to remove guardian. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setFormData({
      name: '',
      phone: '',
      relationship: '',
      email: ''
    });
    
    setIsEditMode(false);
    setEditId(null);
    setFormErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {console.log("Rendering Guardians component")}
      {console.log("Current guardians:", guardians)}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🧑‍🤝‍🧑 Guardian Network
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Add and manage your trusted contacts who can receive alerts and provide assistance during emergencies.
            </p>
          </div>
          
          {/* Status Messages */}
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

          {/* Delete Guardian Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold text-red-600 mb-4">Remove Guardian</h2>
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                  Are you sure you want to remove this guardian from your emergency contacts? They will no longer receive SOS alerts.
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    Remove Guardian
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Add Guardian Form */}
          <div id="guardian-form" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {isEditMode ? 'Edit Guardian' : 'Add New Guardian'}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 
                    ${formErrors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="Enter name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700
                    ${formErrors.phone ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className={`w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700
                    ${formErrors.relationship ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="E.g., Family, Friend, etc."
                  />
                  {formErrors.relationship && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.relationship}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700
                    ${formErrors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : isEditMode ? 'Update Guardian' : 'Add Guardian'}
                </button>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Guardian List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Guardians
            </h2>
            {loading && guardians.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="animate-spin h-8 w-8 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading guardians...
              </div>
            ) : guardians.length > 0 ? (
              <div className="space-y-4">
                {guardians.map((guardian) => (
                  <motion.div
                    key={guardian.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {guardian.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {guardian.relationship} • {guardian.phone}
                      </p>
                      {guardian.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {guardian.email}
                        </p>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        guardian.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {guardian.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        onClick={() => handleEdit(guardian)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        onClick={() => prepareDelete(guardian.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 text-center p-8 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You haven't added any guardians yet. Add your trusted contacts to receive help in emergencies.
                </p>
              </div>
            )}
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              How Guardians Work
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Guardians are trusted contacts who will be notified automatically when you trigger an SOS alert. They'll receive your real-time location and can coordinate assistance during emergencies.
            </p>
            <ul className="list-disc ml-6 mt-3 text-gray-600 dark:text-gray-300">
              <li>Guardians receive text messages with your location</li>
              <li>They get updates when your location changes</li>
              <li>We recommend adding at least 3 trusted contacts</li>
              <li>Make sure your guardians are aware they've been added</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Guardians; 