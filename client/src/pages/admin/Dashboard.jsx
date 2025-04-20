import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  BellAlertIcon, 
  DocumentTextIcon, 
  ShieldExclamationIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/solid';

// Function to generate realistic random data changes
const generateRandomChange = (currentValue, minChange = -5, maxChange = 5, minValue = 0) => {
  const change = Math.floor(Math.random() * (maxChange - minChange + 1)) + minChange;
  return Math.max(minValue, currentValue + change);
};

const AdminDashboard = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    users: { total: 0, new: 0, trend: 'stable' },
    reports: { total: 0, pending: 0, trend: 'stable' },
    sosAlerts: { total: 0, active: 0, trend: 'stable' },
    incidents: { total: 0, resolved: 0, trend: 'stable' }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const previousStats = useRef(null);
  const pollingInterval = useRef(null);
  const realtimeInterval = useRef(null);
  const [simulatedEvent, setSimulatedEvent] = useState(null);
  
  // Simulated event types for real-time updates
  const eventTypes = useMemo(() => [
    { type: 'sos', title: 'New SOS Alert triggered', user: 'Emma Johnson', icon: <BellAlertIcon className="w-5 h-5 text-red-600 dark:text-red-400" />, bgColor: 'bg-red-100 dark:bg-red-900/20' },
    { type: 'user', title: 'New user registered', user: 'Sarah Smith', icon: <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />, bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
    { type: 'report', title: 'New safety report submitted', location: 'Main Street & Oak Avenue', icon: <DocumentTextIcon className="w-5 h-5 text-green-600 dark:text-green-400" />, bgColor: 'bg-green-100 dark:bg-green-900/20' },
    { type: 'incident', title: 'Incident marked as resolved', location: 'Downtown Park', icon: <ShieldExclamationIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />, bgColor: 'bg-purple-100 dark:bg-purple-900/20' }
  ], []);

  // Format time in a human-readable way
  const formatTimeAgo = useCallback((date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    
    if (seconds < 10) return `just now`;
    return `${Math.floor(seconds)} seconds ago`;
  }, []);

  // Determine trend based on previous values
  const determineTrend = useCallback((current, previous, field) => {
    if (!previous) return 'stable';
    const diff = current[field] - previous[field];
    if (diff > 0) return 'up';
    if (diff < 0) return 'down';
    return 'stable';
  }, []);

  // Generate realistic mock data
  const generateMockData = useCallback((previous = null) => {
    // Start with base values if no previous data
    const baseUsers = previous ? previous.users.total : 124;
    const baseReports = previous ? previous.reports.total : 37;
    const baseSosAlerts = previous ? previous.sosAlerts.total : 18;
    const baseIncidents = previous ? previous.incidents.total : 42;
    
    // Generate new values with small random changes
    const users = {
      total: generateRandomChange(baseUsers, -2, 5, 0),
      new: generateRandomChange(previous ? previous.users.new : 8, -1, 3, 0),
      trend: 'stable' // Will calculate after
    };
    
    const reports = {
      total: generateRandomChange(baseReports, -1, 3, 0),
      pending: generateRandomChange(previous ? previous.reports.pending : 12, -2, 2, 0),
      trend: 'stable'
    };
    
    const sosAlerts = {
      total: generateRandomChange(baseSosAlerts, 0, 2, 0),
      active: generateRandomChange(previous ? previous.sosAlerts.active : 3, -1, 1, 0),
      trend: 'stable'
    };
    
    const incidents = {
      total: generateRandomChange(baseIncidents, 0, 3, 0),
      resolved: generateRandomChange(previous ? previous.incidents.resolved : 35, -1, 2, 0),
      trend: 'stable'
    };
    
    // Calculate trends
    if (previous) {
      users.trend = determineTrend(users, previous.users, 'total');
      reports.trend = determineTrend(reports, previous.reports, 'total');
      sosAlerts.trend = determineTrend(sosAlerts, previous.sosAlerts, 'total');
      incidents.trend = determineTrend(incidents, previous.incidents, 'total');
    }
    
    return { users, reports, sosAlerts, incidents };
  }, [determineTrend]);

  // Generate a random real-time event
  const generateRandomEvent = useCallback(() => {
    const eventTemplate = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const names = ['Emma Johnson', 'Michael Chen', 'Sophia Rodriguez', 'David Kim', 'Olivia Williams', 'James Lee'];
    const locations = ['Downtown Park', 'Main Street & 5th Avenue', 'Central Station', 'University Campus', 'Shopping Center', 'Riverside Walk'];
    
    const event = {
      ...eventTemplate,
      id: Date.now(),
      timestamp: new Date(),
      user: names[Math.floor(Math.random() * names.length)],
      location: locations[Math.floor(Math.random() * locations.length)]
    };
    
    return event;
  }, [eventTypes]);

  // Simulate a real-time event (like a websocket message)
  const simulateRealtimeEvent = useCallback(() => {
    // Random chance to generate event (30% chance every 15 seconds)
    const shouldGenerate = Math.random() < 0.3;
    
    if (shouldGenerate) {
      const event = generateRandomEvent();
      setSimulatedEvent(event);
      
      // Update stats based on the event type in a way that doesn't cause flicker
      setStats(prevStats => {
        const newStats = {...prevStats};
        
        switch(event.type) {
          case 'sos':
            newStats.sosAlerts = {
              ...newStats.sosAlerts,
              total: newStats.sosAlerts.total + 1,
              active: newStats.sosAlerts.active + 1,
              trend: 'up'
            };
            break;
          case 'user':
            newStats.users = {
              ...newStats.users,
              total: newStats.users.total + 1,
              new: newStats.users.new + 1,
              trend: 'up'
            };
            break;
          case 'report':
            newStats.reports = {
              ...newStats.reports,
              total: newStats.reports.total + 1,
              pending: newStats.reports.pending + 1,
              trend: 'up'
            };
            break;
          case 'incident':
            if (event.title.includes('resolved')) {
              newStats.incidents = {
                ...newStats.incidents,
                resolved: newStats.incidents.resolved + 1,
                trend: 'up'
              };
            } else {
              newStats.incidents = {
                ...newStats.incidents,
                total: newStats.incidents.total + 1,
                trend: 'up'
              };
            }
            break;
          default:
            break;
        }
        
        return newStats;
      });
      
      // Add to recent activity using a functional update to avoid dependency issues
      setRecentActivity(prev => {
        const newActivity = [
          {
            id: event.id,
            type: event.type,
            title: event.title,
            user: event.user,
            location: event.location,
            timestamp: event.timestamp,
            icon: event.icon,
            bgColor: event.bgColor
          },
          ...prev.slice(0, 9) // Keep only the 10 most recent
        ];
        return newActivity;
      });
    }
  }, [generateRandomEvent]);

  // Fetch dashboard data initially and set up polling
  useEffect(() => {
    const fetchDashboardData = async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        
        // Store previous stats for trend calculation
        if (stats && stats.users) {
          previousStats.current = stats;
        }
        
        // Try to get real data from API
        let realData = null;
        try {
          // Actually fetch user count if possible
          const response = await api.get('/api/admin/stats');
          if (response && response.data) {
            realData = response.data;
          }
        } catch (err) {
          console.log('Using mock data due to API error:', err);
        }
        
        // Generate mock data based on previous values, but use real user count if available
        let mockData = generateMockData(previousStats.current);
        
        // If we got real data, incorporate it 
        if (realData && realData.userCount) {
          mockData = {
            ...mockData,
            users: {
              ...mockData.users,
              total: realData.userCount,
              trend: previousStats.current ? 
                determineTrend({total: realData.userCount}, previousStats.current.users, 'total') : 
                'stable'
            }
          };
        }
        
        // Simulate network delay 
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Batch state updates to prevent flicker
        setStats(mockData);
        setLastUpdated(new Date());
        
        // Generate initial activity if none exists
        if (isInitial || recentActivity.length === 0) {
          const initialActivity = [];
          const timestamps = [5, 25, 60, 120, 180]; // minutes ago
          
          for (let i = 0; i < 5; i++) {
            const eventTemplate = eventTypes[i % eventTypes.length];
            const timestamp = new Date();
            timestamp.setMinutes(timestamp.getMinutes() - timestamps[i]);
            
            initialActivity.push({
              id: Date.now() - i * 1000,
              type: eventTemplate.type,
              title: eventTemplate.title,
              user: eventTemplate.user || 'Unknown User',
              location: eventTemplate.location || 'Unknown Location',
              timestamp,
              icon: eventTemplate.icon,
              bgColor: eventTemplate.bgColor
            });
          }
          
          setRecentActivity(initialActivity);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Show appropriate error
      } finally {
        if (isInitial) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    };
    
    // Initial fetch
    fetchDashboardData(true);
    
    // Set up polling every 30 seconds
    pollingInterval.current = setInterval(() => {
      fetchDashboardData(false);
    }, 30000);
    
    // Set up "real-time" event simulation every 15 seconds
    realtimeInterval.current = setInterval(() => {
      simulateRealtimeEvent();
    }, 15000);
    
    // Clean up on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      if (realtimeInterval.current) {
        clearInterval(realtimeInterval.current);
      }
    };
  }, [api, generateMockData, simulateRealtimeEvent, determineTrend, eventTypes]);

  // Handle clicking on stat cards
  const handleStatCardClick = useCallback((link) => {
    navigate(link);
  }, [navigate]);
  
  // Force refresh data
  const handleRefresh = useCallback(async () => {
    previousStats.current = stats;
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshing(true);
    
    try {
      // Try to get real data from API
      let realData = null;
      try {
        const response = await api.get('/api/admin/stats');
        if (response && response.data) {
          realData = response.data;
        }
      } catch (err) {
        console.log('Using mock data due to API error:', err);
      }
      
      // Generate mock data based on previous values
      let mockData = generateMockData(previousStats.current);
      
      // If we got real data, incorporate it 
      if (realData && realData.userCount) {
        mockData = {
          ...mockData,
          users: {
            ...mockData.users,
            total: realData.userCount,
            trend: determineTrend({total: realData.userCount}, previousStats.current.users, 'total')
          }
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStats(mockData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [api, generateMockData, stats, determineTrend]);

  // Create stat cards with dynamic data - memoized to prevent unnecessary re-renders
  const statCards = useMemo(() => [
    {
      title: 'Total Users',
      value: stats.users.total,
      change: `+${stats.users.new} new`,
      icon: <UsersIcon className="w-8 h-8 text-blue-500" />,
      link: '/admin/users',
      color: 'blue',
      trend: stats.users.trend
    },
    {
      title: 'Safety Reports',
      value: stats.reports.total,
      change: `${stats.reports.pending} pending`,
      icon: <DocumentTextIcon className="w-8 h-8 text-green-500" />,
      link: '/admin/reports',
      color: 'green',
      trend: stats.reports.trend
    },
    {
      title: 'SOS Alerts',
      value: stats.sosAlerts.total,
      change: `${stats.sosAlerts.active} active`,
      icon: <BellAlertIcon className="w-8 h-8 text-red-500" />,
      link: '/admin/sos-alerts',
      color: 'red',
      isAlert: stats.sosAlerts.active > 0,
      trend: stats.sosAlerts.trend
    },
    {
      title: 'Safety Incidents',
      value: stats.incidents.total,
      change: `${stats.incidents.resolved} resolved`,
      icon: <ShieldExclamationIcon className="w-8 h-8 text-purple-500" />,
      link: '/admin/incidents',
      color: 'purple',
      trend: stats.incidents.trend
    },
  ], [stats]);
  
  // Get trend icon based on trend direction
  const getTrendIcon = useCallback((trend) => {
    switch(trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  }, []);
  
  // Render a stat card with animations
  const renderStatCard = useCallback((stat) => {
    const bgColor = stat.isAlert 
      ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10 border-red-300 dark:border-red-700' 
      : 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700';
    
    return (
      <motion.div 
        key={stat.title} 
        className={`${bgColor} border rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleStatCardClick(stat.link)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        layout
      >
        {stat.isAlert && (
          <motion.div 
            className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full mr-2 mt-2"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
            <div className="flex items-center">
              <motion.h3 
                className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}
                key={`${stat.title}-${stat.value}`}
                initial={{ opacity: 0.5, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                layout
              >
                {loading ? '...' : stat.value}
              </motion.h3>
              {getTrendIcon(stat.trend) && (
                <motion.span 
                  className="ml-2" 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {getTrendIcon(stat.trend)}
                </motion.span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm font-medium">
              {loading ? '...' : stat.change}
            </p>
          </div>
          <div>
            {stat.icon}
          </div>
        </div>
      </motion.div>
    );
  }, [loading, handleStatCardClick, getTrendIcon]);

  // Memoize the entire recent activity list to prevent unnecessary re-renders
  const memoizedActivityList = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    return (
      <AnimatePresence initial={false}>
        {recentActivity.map((activity, index) => (
          <motion.div 
            key={activity.id}
            className="flex items-start"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.05 
            }}
            layout
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center mr-3`}>
              {activity.icon}
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">{activity.title}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activity.user && `${activity.user} - `}
                {activity.location && `${activity.location} - `}
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    );
  }, [loading, recentActivity, formatTimeAgo]);

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-4 h-4 mr-1" />
            Last updated: {formatTimeAgo(lastUpdated)}
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {/* Notification for real-time updates */}
      <AnimatePresence>
        {simulatedEvent && (
          <motion.div 
            className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            key={simulatedEvent.id}
            onAnimationComplete={() => {
              // Clear the simulated event after showing it for 5 seconds
              setTimeout(() => setSimulatedEvent(null), 5000);
            }}
            layout
          >
            <div className="flex items-center">
              <div className={`${simulatedEvent.bgColor} p-2 rounded-full mr-3`}>
                {simulatedEvent.icon}
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300">Real-time Update</p>
                <p className="text-blue-700 dark:text-blue-400">{simulatedEvent.title}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(renderStatCard)}
      </div>
      
      {/* Quick Actions Section */}
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        layout
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button 
            className="flex items-center justify-center px-4 py-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/users')}
          >
            <UsersIcon className="w-5 h-5 mr-2" />
            Manage Users
          </motion.button>
          <motion.button 
            className={`flex items-center justify-center px-4 py-3 ${stats.sosAlerts.active > 0 ? 'animate-pulse' : ''} bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-all`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/sos-alerts')}
          >
            <BellAlertIcon className="w-5 h-5 mr-2" />
            View Active Alerts
            {stats.sosAlerts.active > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats.sosAlerts.active}
              </span>
            )}
          </motion.button>
          <motion.button 
            className="flex items-center justify-center px-4 py-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/reports')}
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Review Reports
            {stats.reports.pending > 0 && (
              <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats.reports.pending}
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
      
      {/* Recent Activity */}
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        layout
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {memoizedActivityList}
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(AdminDashboard); 