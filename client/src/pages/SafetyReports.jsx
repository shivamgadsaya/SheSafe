import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';

const SafetyReports = () => {
  // State for reports data
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    incidentType: 'all',
    timeframe: 'all',
    searchQuery: '',
    locationRadius: 'all'
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('list');
  
  // State for selected report
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Auth context for token
  const { token } = useAuth();

  // Filter options
  const incidentTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'harassment', label: 'Harassment' },
    { id: 'stalking', label: 'Stalking' },
    { id: 'assault', label: 'Assault' },
    { id: 'theft', label: 'Theft' },
    { id: 'suspicious_activity', label: 'Suspicious Activity' },
    { id: 'infrastructure', label: 'Infrastructure Issue' },
    { id: 'other', label: 'Other' }
  ];
  
  const timeframeOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
  ];
  
  const radiusOptions = [
    { id: 'all', label: 'All Areas' },
    { id: 'nearby', label: 'Within 1 mile' },
    { id: 'neighborhood', label: 'My Neighborhood' },
    { id: 'city', label: 'My City' }
  ];

  // Load data on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch reports from API
        const response = await axios.get(`${API_BASE_URL}/api/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Fetched reports from API:', response.data);
        
        // Transform API data to match expected format
        const transformedReports = response.data.map(report => ({
          id: report._id,
          incidentType: report.incidentType || 'other',
          title: report.title,
          description: report.description,
          location: report.address,
          date: report.createdAt || report.date,
          time: report.time || new Date(report.createdAt).toLocaleTimeString(),
          reportedBy: report.user?.name || 'Anonymous',
          verified: report.status === 'verified',
          status: report.status || 'active',
          lat: report.location?.coordinates[1] || 0,
          lng: report.location?.coordinates[0] || 0,
          upvotes: report.upvotes || 0,
          comments: report.comments || 0
        }));
        
        setReports(transformedReports);
        setFilteredReports(transformedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError('Failed to load reports');
        
        // Create empty reports array on error
        setReports([]);
        setFilteredReports([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [token]);

  // Apply filters when the filter state changes
  useEffect(() => {
    applyFilters();
  }, [filters, reports]);

  // Filter reports based on selected filters
  const applyFilters = () => {
    let results = [...reports];
    
    // Filter by incident type
    if (filters.incidentType !== 'all') {
      results = results.filter(report => report.incidentType === filters.incidentType);
    }
    
    // Filter by timeframe
    if (filters.timeframe !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      if (filters.timeframe === 'today') {
        cutoffDate.setHours(0, 0, 0, 0);
      } else if (filters.timeframe === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (filters.timeframe === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      }
      
      results = results.filter(report => {
        const reportDate = new Date(report.date);
        return reportDate >= cutoffDate;
      });
    }
    
    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(report => 
        report.title.toLowerCase().includes(query) || 
        report.description.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query)
      );
    }
    
    // Location radius filtering
    if (filters.locationRadius !== 'all') {
      // This would use browser geolocation and calculate distance in a real app
      if (filters.locationRadius === 'nearby') {
        results = results.filter(report => report.id % 2 === 0); // Simplified for demo
      } else if (filters.locationRadius === 'neighborhood') {
        results = results.filter(report => report.id % 3 === 0); // Simplified for demo
      }
    }
    
    setFilteredReports(results);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value;
    setFilters(prev => ({
      ...prev,
      searchQuery: query
    }));
  };

  // Handle report selection
  const handleReportSelect = (report) => {
    setSelectedReport(report);
    
    // In a map view, center the map on this report
    if (activeTab === 'map') {
      console.log('Centering map on:', report.location);
    }
  };

  // Handle upvote
  const handleUpvote = async (reportId) => {
    try {
      // Update UI optimistically
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          return { ...report, upvotes: report.upvotes + 1 };
        }
        return report;
      });
      
      setReports(updatedReports);
      applyFilters();
      
      // In a real implementation, you would call an API here
    } catch (error) {
      console.error('Error upvoting report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Community Safety Map
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-5">
              Stay informed about safety incidents in your area and help create a safer community by reporting incidents.
            </p>
            <Link 
              to="/report-incident" 
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Report an Incident
            </Link>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Panel */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Filters
                </h2>
                
                <div className="space-y-4">
                  {/* Incident Type Filter */}
                  <div>
                    <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Incident Type
                    </label>
                    <select
                      id="incidentType"
                      name="incidentType"
                      value={filters.incidentType}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                    >
                      {incidentTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Timeframe Filter */}
                  <div>
                    <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timeframe
                    </label>
                    <select
                      id="timeframe"
                      name="timeframe"
                      value={filters.timeframe}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                    >
                      {timeframeOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Location Radius Filter */}
                  <div>
                    <label htmlFor="locationRadius" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <select
                      id="locationRadius"
                      name="locationRadius"
                      value={filters.locationRadius}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                    >
                      {radiusOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Search */}
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search reports..."
                      value={filters.searchQuery}
                      onChange={handleSearch}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Report Count */}
                  <div className="pt-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredReports.length} reports found
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reports Display */}
            <div className="w-full lg:w-3/4">
              {/* View Toggle Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none transition-colors ${
                      activeTab === 'list'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none transition-colors ${
                      activeTab === 'map'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Map View
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none transition-colors ${
                      activeTab === 'stats'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Statistics
                  </button>
                </div>
              </div>
              
              {/* Content based on active tab */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 min-h-[500px]">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
                    <p className="text-gray-600 dark:text-gray-400">Please try again later.</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'list' && (
                      <div className="space-y-4">
                        {filteredReports.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400">No reports match your filters.</p>
                          </div>
                        ) : (
                          filteredReports.map(report => (
                            <motion.div
                              key={report.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow ${
                                selectedReport?.id === report.id ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => handleReportSelect(report)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center flex-wrap gap-2 mb-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      report.incidentType === 'harassment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                      report.incidentType === 'stalking' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                      report.incidentType === 'assault' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                      report.incidentType === 'theft' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                      {report.incidentType.charAt(0).toUpperCase() + report.incidentType.slice(1).replace('_', ' ')}
                                    </span>
                                    {report.verified && (
                                      <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 text-xs rounded-full">
                                        Verified
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(report.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {report.title}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                    {report.description}
                                  </p>
                                  <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-3">
                                    <span className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      {report.location}
                                    </span>
                                    <span className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      {report.reportedBy}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-center ml-4">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpvote(report.id);
                                    }}
                                    className="flex flex-col items-center space-y-1 group"
                                  >
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{report.upvotes}</span>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'map' && (
                      <div className="h-[500px] relative rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex justify-center items-center bg-gray-100 dark:bg-gray-700">
                          <div className="text-center p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              Interactive Map View
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              The map would display all incidents geographically, allowing you to see hotspots and patterns.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'stats' && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                          Safety Incident Statistics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                              Incidents by Type
                            </h4>
                            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-center items-center">
                              <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                  Pie chart visualization would go here
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                              Incidents over Time
                            </h4>
                            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-center items-center">
                              <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                  Line chart visualization would go here
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="bg-primary/10 dark:bg-primary/5 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Help Build a Safer Community
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
              Your reports help make our community safer for everyone. Share your experiences and stay informed about safety concerns in your area.
            </p>
            <Link 
              to="/report-incident" 
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Submit a Report
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SafetyReports; 