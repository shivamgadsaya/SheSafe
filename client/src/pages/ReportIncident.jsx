import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReportIncident = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    incidentType: '',
    address: '',
    date: '',
    time: '',
    description: '',
    title: '',
    severity: 'medium',
    evidence: []
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const incidentTypes = [
    { id: 'harassment', label: 'Harassment' },
    { id: 'assault', label: 'Assault' },
    { id: 'theft', label: 'Theft' },
    { id: 'suspicious_activity', label: 'Suspicious Activity' },
    { id: 'vandalism', label: 'Vandalism' },
    { id: 'infrastructure', label: 'Infrastructure Issue' },
    { id: 'other', label: 'Other (specify in description)' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'You must be logged in to submit a report. Please log in and try again.'
      });
      return;
    }
    
    setLoading(true);
    
    // Create title from incident type if not provided
    const title = formData.title || `${formData.incidentType.replace('_', ' ')} incident`;
    
    // Format date and time
    const reportData = {
      ...formData,
      title,
      address: formData.address // backend expects 'address' field
    };
    
    // Add date information if provided
    if (formData.date) {
      reportData.date = formData.date + (formData.time ? `T${formData.time}:00` : 'T00:00:00');
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/reports', reportData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Your incident report has been submitted successfully. Thank you for contributing to community safety.'
      });
      
      // Reset form after successful submission
      setFormData({
        incidentType: '',
        address: '',
        date: '',
        time: '',
        description: '',
        title: '',
        severity: 'medium',
        evidence: []
      });
      
      // Redirect to view reports after a delay
      setTimeout(() => {
        navigate('/my-reports');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      
      let errorMessage = 'There was an error submitting your report. Please try again.';
      
      // Extract more specific error message if available
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
        
        // If we have validation errors, show the first one
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          errorMessage = error.response.data.errors[0];
        }
      }
      
      setFormStatus({
        submitted: true,
        success: false,
        message: errorMessage
      });
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Report an Incident
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Help keep our community safe by reporting incidents. {!isAuthenticated && 'You need to be logged in to submit a report.'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 md:p-8">
            {formStatus.submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 mb-6 rounded-lg ${
                  formStatus.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}
              >
                {formStatus.message}
              </motion.div>
            )}
            
            {!isAuthenticated && (
              <div className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                You must be logged in to submit a report. <button 
                  onClick={() => navigate('/login')}
                  className="underline font-medium"
                >
                  Log in here
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief title for your report (optional)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                />
              </div>
            
              <div>
                <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Incident Type *
                </label>
                <select
                  id="incidentType"
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                >
                  <option value="" disabled>Select incident type</option>
                  {incidentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address or location description"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Please provide details about what happened"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                ></textarea>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !isAuthenticated}
                  className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Safety Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Safety Reminders
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>If you're in immediate danger, always call emergency services first.</li>
              <li>Consider using the SOS feature in the app if you need immediate help.</li>
              <li>Your reports help us identify safety patterns and improve community awareness.</li>
              <li>Photos or evidence can be uploaded to help validate reports (coming soon).</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportIncident; 