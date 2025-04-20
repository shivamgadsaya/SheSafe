import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    if (token) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/reports/my-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setReports(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load your reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = () => {
    if (filter === 'all') return reports;
    return reports.filter(report => report.status === filter);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'verified':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReportClick = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 md:p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Login Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">You need to be logged in to view your reports.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              My Reports
            </h1>
            <button
              onClick={() => navigate('/report-incident')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              Report New Incident
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'pending'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'verified'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'resolved'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Resolved
              </button>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredReports().length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReports().map((report) => (
                  <div 
                    key={report._id} 
                    className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => handleReportClick(report._id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {report.title}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                          <p>
                            <span className="font-medium">Type:</span> {report.incidentType.replace('_', ' ')}
                          </p>
                          <p>
                            <span className="font-medium">Location:</span> {report.address}
                          </p>
                          <p>
                            <span className="font-medium">Severity:</span> {report.severity}
                          </p>
                          <p>
                            <span className="font-medium">Reported:</span> {formatDate(report.createdAt)}
                          </p>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                          {report.description.length > 150
                            ? `${report.description.substring(0, 150)}...`
                            : report.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 self-center">
                        <button
                          className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                          aria-label="View details"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReportClick(report._id);
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'all'
                    ? "You haven't submitted any reports yet."
                    : `You don't have any ${filter} reports.`}
                </p>
                <button
                  onClick={() => navigate('/report-incident')}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Create Your First Report
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyReports; 