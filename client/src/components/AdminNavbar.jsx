import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  UsersIcon, 
  BellAlertIcon, 
  DocumentTextIcon, 
  ShieldExclamationIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    // Special case for dashboard - match either /admin or /admin/
    if (path === '/admin' && (location.pathname === '/admin' || location.pathname === '/admin/')) {
      return 'bg-primary-dark text-white';
    }
    
    // For other paths, check if the current location starts with the path
    if (path !== '/admin' && location.pathname.startsWith(path)) {
      return 'bg-primary-dark text-white';
    }
    
    // Otherwise, not active
    return 'text-gray-600 hover:bg-primary/10';
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <HomeIcon className="w-5 h-5" />
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <UsersIcon className="w-5 h-5" />
    },
    {
      name: 'SOS Alerts',
      path: '/admin/sos-alerts',
      icon: <BellAlertIcon className="w-5 h-5" />
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: <DocumentTextIcon className="w-5 h-5" />
    },
    {
      name: 'Safety Incidents',
      path: '/admin/incidents',
      icon: <ShieldExclamationIcon className="w-5 h-5" />
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md">
      {/* Desktop Navigation */}
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4 px-6">
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center">
              <span className="text-xl font-bold text-primary mr-2">SheSafe</span>
              <span className="text-sm bg-primary text-white px-2 py-1 rounded">Admin</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive(item.path)}`}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center cursor-pointer">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
                  <span className="text-xs text-gray-500">Administrator</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="ml-4 flex items-center text-red-500 hover:text-red-700"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive(item.path)}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar; 