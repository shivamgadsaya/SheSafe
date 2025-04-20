import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const GuardianDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [dependents, setDependents] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load dependents and active alerts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dependents
        const dependentsResponse = await axios.get('/api/guardians/dependents');
        setDependents(dependentsResponse.data);
        
        // Fetch active alerts
        const alertsResponse = await axios.get('/api/guardians/alerts');
        setActiveAlerts(alertsResponse.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching guardian data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up a refresh interval for alerts
    const interval = setInterval(async () => {
      try {
        const alertsResponse = await axios.get('/api/guardians/alerts');
        setActiveAlerts(alertsResponse.data);
      } catch (err) {
        console.error('Error refreshing alerts:', err);
      }
    }, 30000); // Refresh every 30 seconds
    
    setRefreshInterval(interval);
    
    // Clean up interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const handleRespondToAlert = async (alertId) => {
    try {
      setLoading(true);
      await axios.post(`/api/guardians/respond/${alertId}`);
      
      // Refresh alerts
      const alertsResponse = await axios.get('/api/guardians/alerts');
      setActiveAlerts(alertsResponse.data);
      
      setError('');
    } catch (err) {
      console.error('Error responding to alert:', err);
      setError('Failed to respond to alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Function to open location in Google Maps
  const openInMaps = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto px-4"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Guardian Dashboard
        </h1>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Active Alerts Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Active SOS Alerts
          </h2>
          
          {loading && activeAlerts.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              Loading alerts...
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No active alerts at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-lg p-4"
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {alert.user.name} - EMERGENCY SOS
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Triggered at {formatTime(alert.createdAt)} on {formatDate(alert.createdAt)}
                      </p>
                      <p className="mt-2">
                        <button
                          onClick={() => openInMaps(alert.location.coordinates[1], alert.location.coordinates[0])}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          View Location
                        </button>
                      </p>
                      {alert.description && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          {alert.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0">
                      <button
                        onClick={() => handleRespondToAlert(alert._id)}
                        disabled={loading || alert.responders.includes(user._id)}
                        className={`px-4 py-2 rounded-lg ${
                          alert.responders.includes(user._id)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-primary text-white hover:bg-primary-dark'
                        } transition-colors disabled:opacity-50`}
                      >
                        {alert.responders.includes(user._id)
                          ? 'Responded'
                          : 'Respond Now'}
                      </button>
                      <a 
                        href={`tel:${alert.user.phone}`}
                        className="mt-2 md:ml-2 inline-block px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Dependents Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Dependents
          </h2>
          
          {loading && dependents.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              Loading dependents...
            </div>
          ) : dependents.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              You don't have any dependents yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dependents.map((dependent) => (
                <div 
                  key={dependent._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                    {dependent.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {dependent.email}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {dependent.phone}
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <a
                      href={`tel:${dependent.phone}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Call
                    </a>
                    <a
                      href={`sms:${dependent.phone}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Message
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GuardianDashboard; 