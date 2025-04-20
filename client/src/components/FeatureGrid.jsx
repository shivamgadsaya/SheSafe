import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureButton from './FeatureButton';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ShieldExclamationIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon, 
  ClipboardDocumentListIcon,
  UserIcon,
  MapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const FeatureGrid = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    sosActive: false,
    activeGuardians: 0,
    communityReports: 0,
    resourcesCount: 0
  });
  
  useEffect(() => {
    // Use mock data for the demo instead of making API calls that might 404
    const updateStats = () => {
      try {
        // Count guardians from user object if available
        let guardianCount = 0;
        if (user?.guardians) {
          guardianCount = user.guardians.length;
        } else if (user?.emergencyContacts) {
          guardianCount = user.emergencyContacts.length;
        } else {
          guardianCount = 3; // Default for demo
        }
        
        // Update stats with mock data 
        setStats({
          sosActive: false, // Default to no active SOS
          activeGuardians: guardianCount,
          communityReports: 7, // Mock data
          resourcesCount: 12 // Mock data
        });
        
        console.log('Stats updated with mock data');
      } catch (error) {
        console.error('Error updating stats:', error);
        // Fallback values
        setStats({
          sosActive: false,
          activeGuardians: 3,
          communityReports: 7,
          resourcesCount: 12
        });
      }
    };

    // Update stats immediately
    updateStats();
    
    // Set up a refresh interval to periodically update stats
    const intervalId = setInterval(updateStats, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId); // Clean up on unmount
  }, [user]);

  // Handle feature click with authentication check
  const handleFeatureClick = (e, path) => {
    e.preventDefault();
    
    console.log(`Attempting to navigate to: ${path}`);
    
    // Check if user is authenticated before navigating to protected routes
    if (!isAuthenticated && (path === '/community' || path === '/resources')) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    } else {
      // For Guardian Network, always navigate directly
      console.log(`Navigating to ${path}`);
      navigate(path);
    }
  };

  // Features with dynamic properties based on stats
  const features = [
    {
      id: 'sos',
      title: 'Emergency SOS',
      icon: '🆘',
      description: 'Send instant alerts to your guardians with your location',
      to: '/sos',
      bgColor: 'bg-red-500',
      status: stats.sosActive ? 'Active' : null
    },
    {
      id: 'guardians',
      title: 'Guardian Network',
      icon: '👥',
      description: 'Manage your trusted contacts who receive your alerts',
      to: '/guardians',
      bgColor: 'bg-blue-500',
      count: stats.activeGuardians
    },
    {
      id: 'community',
      title: 'Community Safety',
      icon: '🏙️',
      description: 'View and report safety concerns in your community',
      to: '/community',
      bgColor: 'bg-purple-500',
      count: stats.communityReports
    },
    {
      id: 'resources',
      title: 'Safety Resources',
      icon: '📚',
      description: 'Access guides, videos and tips on personal safety',
      to: '/resources',
      bgColor: 'bg-green-500',
      count: stats.resourcesCount
    }
  ];

  const isUser = !user || user.role === 'user';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {isUser && (
        <FeatureButton
          to="/sos"
          icon={<ShieldExclamationIcon className="h-6 w-6 text-red-500" />}
          title="SOS Alert"
          description="Send immediate alerts to your guardians in case of emergency"
          color="border-red-500"
        />
      )}
      
      <FeatureButton
        to="/community"
        icon={<UserGroupIcon className="h-6 w-6 text-blue-500" />}
        title="Community"
        description="Connect with the safety community and access forums"
        color="border-blue-500"
      />
      
      <FeatureButton
        to="/report-incident"
        icon={<ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />}
        title="Report Incident"
        description="Report safety concerns or incidents in your area"
        color="border-yellow-500"
      />
      
      <FeatureButton
        to="/my-reports"
        icon={<ClipboardDocumentListIcon className="h-6 w-6 text-purple-500" />}
        title="My Reports"
        description="View and manage all your submitted incident reports"
        color="border-purple-500"
      />
      
      <FeatureButton
        to="/profile"
        icon={<UserIcon className="h-6 w-6 text-green-500" />}
        title="Profile"
        description="Manage your personal details and safety preferences"
        color="border-green-500"
      />
      
      <FeatureButton
        to="/resources"
        icon={<BookOpenIcon className="h-6 w-6 text-indigo-500" />}
        title="Resources"
        description="Access safety tips and useful information for women's safety"
        color="border-indigo-500"
      />
    </div>
  );
};

export default FeatureGrid;