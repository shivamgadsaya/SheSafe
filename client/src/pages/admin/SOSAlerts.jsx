import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BellAlertIcon,
  XMarkIcon,
  CheckIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const SOSAlerts = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [historicalAlerts, setHistoricalAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  useEffect(() => {
    fetchAlerts();
    
    // Set up a polling interval for real-time updates
    const pollingInterval = setInterval(() => {
      fetchAlerts(false); // Don't show loading indicator for poll updates
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(pollingInterval);
  }, []);
  
  const fetchAlerts = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      // Use the admin API endpoint
      console.log('Fetching SOS alerts from API');
      const response = await api.get('/api/sos/admin/alerts');
      console.log('SOS alerts response:', response.data);
      
      // Use the actual API response data
      setActiveAlerts(response.data.activeAlerts || []);
      setHistoricalAlerts(response.data.historicalAlerts || []);
      setError('');
    } catch (err) {
      console.error('Error fetching SOS alerts:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Access denied. Admin privileges required. Please log out and log back in as an admin.');
      } else {
        setError('Failed to fetch SOS alerts. Using mock data as fallback.');
      }
      
      // If API call fails, use mock data as fallback
      setActiveFallbackData();
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  
  const setActiveFallbackData = () => {
    // Mock data as fallback
    const mockActiveAlerts = [
      {
        _id: '1',
        user: {
          _id: 'u1',
          name: 'Emma Johnson',
          phone: '+1 555-123-4567',
          email: 'emma@example.com'
        },
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        status: 'active',
        description: 'I feel unsafe walking home. Someone is following me.',
        createdAt: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
        guardiansNotified: ['g1', 'g2'],
        lastLocationUpdate: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
      },
      {
        _id: '2',
        user: {
          _id: 'u2',
          name: 'Sophia Chen',
          phone: '+1 555-987-6543',
          email: 'sophia@example.com'
        },
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128]
        },
        status: 'active',
        description: 'Car broke down in an unfamiliar area.',
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        guardiansNotified: ['g3'],
        lastLocationUpdate: new Date(Date.now() - 1000 * 60 * 1) // 1 minute ago
      }
    ];
    
    const mockHistoricalAlerts = [
      {
        _id: '3',
        user: {
          _id: 'u3',
          name: 'Lisa Wang',
          phone: '+1 555-234-5678',
          email: 'lisa@example.com'
        },
        location: {
          type: 'Point',
          coordinates: [-87.6298, 41.8781]
        },
        status: 'resolved',
        description: 'Suspicious person outside my apartment.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        guardiansNotified: ['g4', 'g5']
      },
      {
        _id: '4',
        user: {
          _id: 'u4',
          name: 'Maria Rodriguez',
          phone: '+1 555-345-6789',
          email: 'maria@example.com'
        },
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522]
        },
        status: 'cancelled',
        description: 'False alarm, I am safe.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5), // 4.5 hours ago
        guardiansNotified: ['g6']
      }
    ];
    
    setActiveAlerts(mockActiveAlerts);
    setHistoricalAlerts(mockHistoricalAlerts);
  };
  
  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
  };
  
  const handleStatusUpdate = async (alertId, newStatus) => {
    try {
      // Call the admin status update API
      await api.put(`/api/sos/admin/${alertId}/status`, { status: newStatus });
      
      // After successful update, refresh alerts
      fetchAlerts();
      
      // Close alert modal if open
      if (showAlertModal) {
        setShowAlertModal(false);
      }
    } catch (err) {
      console.error('Error updating SOS alert status:', err);
      
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to update alert status. Please try again.');
      }
    }
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString();
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };
  
  const calculateElapsedTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'en_route':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'on_scene':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const renderAlertModal = () => {
    if (!selectedAlert) return null;
    
    const isActive = selectedAlert.status === 'active' || 
                    selectedAlert.status === 'en_route' || 
                    selectedAlert.status === 'on_scene';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <BellAlertIcon className="w-6 h-6 mr-2 text-red-500" />
              SOS Alert Details
            </h2>
            <button
              onClick={() => setShowAlertModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Status and Timing Info */}
            <div className="flex justify-between items-center">
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedAlert.status)}`}>
                  {selectedAlert.status.toUpperCase()}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isActive ? (
                    <>Alert active for {calculateElapsedTime(selectedAlert.createdAt)}</>
                  ) : (
                    <>
                      {selectedAlert.status === 'resolved' ? 'Resolved' : 'Cancelled'} on {formatDate(selectedAlert.resolvedAt)} at {formatTime(selectedAlert.resolvedAt)}
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="font-medium">{formatDate(selectedAlert.createdAt)} {formatTime(selectedAlert.createdAt)}</p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                User Information
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {selectedAlert.user.name}</p>
                <p><span className="font-medium">Phone:</span> {selectedAlert.user.phone}</p>
                <p><span className="font-medium">Email:</span> {selectedAlert.user.email}</p>
              </div>
              <div className="mt-3 flex space-x-2">
                <a 
                  href={`tel:${selectedAlert.user.phone}`}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-sm"
                >
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  Call User
                </a>
                <a 
                  href={`sms:${selectedAlert.user.phone}`}
                  className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Text User
                </a>
              </div>
            </div>
            
            {/* Location Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-red-500" />
                Location Information
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Coordinates:</span> {selectedAlert.location.coordinates[1]}, {selectedAlert.location.coordinates[0]}</p>
                {selectedAlert.lastLocationUpdate && (
                  <p><span className="font-medium">Last updated:</span> {formatTime(selectedAlert.lastLocationUpdate)}</p>
                )}
              </div>
              <div className="mt-3">
                <a 
                  href={`https://maps.google.com/?q=${selectedAlert.location.coordinates[1]},${selectedAlert.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Open in Maps
                </a>
              </div>
            </div>
            
            {/* Emergency Description */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Emergency Description
              </h3>
              <p className="text-gray-800 dark:text-gray-200">
                {selectedAlert.description || "No description provided."}
              </p>
            </div>
            
            {/* Guardians Notified */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Emergency Contacts Notified
              </h3>
              <p className="text-gray-800 dark:text-gray-200">
                {selectedAlert.guardiansNotified?.length || 0} emergency contacts notified
              </p>
            </div>
            
            {/* Action Buttons */}
            {isActive && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
                <div className="space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedAlert._id, 'resolved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <CheckIcon className="w-5 h-5 inline mr-1" />
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedAlert._id, 'cancelled')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <XMarkIcon className="w-5 h-5 inline mr-1" />
                    Cancel Alert
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setShowAlertModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SOS Alerts</h1>
        <button
          onClick={() => fetchAlerts()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Refresh Alerts
        </button>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {/* Active Alerts Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active SOS Alerts</h2>
          {activeAlerts.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {activeAlerts.length}
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading SOS alerts...</p>
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">No active SOS alerts at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeAlerts.map(alert => (
              <div 
                key={alert._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-l-4 border-red-500"
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                        ACTIVE
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {calculateElapsedTime(alert.createdAt)} ago
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {alert.user.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 truncate max-w-md">
                      {alert.description || "No description provided"}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <div className="text-right md:mr-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                      <a 
                        href={`https://maps.google.com/?q=${alert.location.coordinates[1]},${alert.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Map
                      </a>
                    </div>
                    <button
                      onClick={() => handleViewAlert(alert)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Historical Alerts Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">SOS Alert History</h2>
        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading alert history...</p>
          </div>
        ) : historicalAlerts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">No historical alerts to display.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {historicalAlerts.map(alert => (
                    <tr key={alert._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {alert.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {alert.user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(alert.createdAt)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(alert.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(alert.status)}`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {alert.resolvedAt ? 
                          calculateElapsedTime(new Date(alert.createdAt) - new Date(alert.resolvedAt)) : 
                          'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewAlert(alert)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Alert Modal */}
      {showAlertModal && renderAlertModal()}
    </div>
  );
};

export default SOSAlerts; 