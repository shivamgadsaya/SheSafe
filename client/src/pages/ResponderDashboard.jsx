import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ResponderDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [pastAlerts, setPastAlerts] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  // Load alerts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active alerts
        const activeResponse = await axios.get('/api/responders/alerts/active');
        setActiveAlerts(activeResponse.data);
        
        // Fetch past alerts that this responder was involved with
        const pastResponse = await axios.get('/api/responders/alerts/past');
        setPastAlerts(pastResponse.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching responder data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up a refresh interval for active alerts
    const interval = setInterval(async () => {
      try {
        const activeResponse = await axios.get('/api/responders/alerts/active');
        setActiveAlerts(activeResponse.data);
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
      await axios.post(`/api/responders/respond/${alertId}`);
      
      // Refresh alerts
      const activeResponse = await axios.get('/api/responders/alerts/active');
      setActiveAlerts(activeResponse.data);
      
      setSuccess('You are now responding to this alert');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error responding to alert:', err);
      setError('Failed to respond to alert. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    
    try {
      setLoading(true);
      await axios.put(`/api/responders/alerts/${selectedAlert._id}/status`, {
        status,
        notes
      });
      
      // Refresh alerts
      const activeResponse = await axios.get('/api/responders/alerts/active');
      setActiveAlerts(activeResponse.data);
      
      const pastResponse = await axios.get('/api/responders/alerts/past');
      setPastAlerts(pastResponse.data);
      
      setSuccess('Alert status updated successfully');
      setSelectedAlert(null);
      setStatus('');
      setNotes('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating alert status:', err);
      setError('Failed to update alert status. Please try again.');
      setTimeout(() => setError(''), 3000);
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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'en_route':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'on_scene':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
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
          Emergency Responder Dashboard
        </h1>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        {/* Status Update Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Update Alert Status
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Updating status for alert from {selectedAlert.user.name}
              </p>
              
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700"
                  >
                    <option value="">Select status</option>
                    <option value="en_route">En Route</option>
                    <option value="on_scene">On Scene</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700"
                    placeholder="Add any relevant notes about the situation"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAlert(null);
                      setStatus('');
                      setNotes('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !status}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </motion.div>
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
              No active alerts in your area.
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
                        <span className={`px-2 py-1 text-xs rounded-full mr-2 ${getStatusColor(alert.status)}`}>
                          {alert.status === 'active' && 'ACTIVE'}
                          {alert.status === 'en_route' && 'EN ROUTE'}
                          {alert.status === 'on_scene' && 'ON SCENE'}
                          {alert.status === 'resolved' && 'RESOLVED'}
                        </span>
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
                    <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                      {!alert.responders.includes(user._id) ? (
                        <button
                          onClick={() => handleRespondToAlert(alert._id)}
                          disabled={loading}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : 'Respond Now'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          Update Status
                        </button>
                      )}
                      <a 
                        href={`tel:${alert.user.phone}`}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Call User
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Past Alerts Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Past Responses
          </h2>
          
          {loading && pastAlerts.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              Loading past alerts...
            </div>
          ) : pastAlerts.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              You haven't responded to any alerts yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Notes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {pastAlerts.map((alert) => (
                    <tr key={alert._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(alert.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {alert.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {alert.user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>
                          {alert.status === 'active' && 'ACTIVE'}
                          {alert.status === 'en_route' && 'EN ROUTE'}
                          {alert.status === 'on_scene' && 'ON SCENE'}
                          {alert.status === 'resolved' && 'RESOLVED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {alert.notes || 'No notes'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openInMaps(alert.location.coordinates[1], alert.location.coordinates[0])}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View Location
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResponderDashboard; 