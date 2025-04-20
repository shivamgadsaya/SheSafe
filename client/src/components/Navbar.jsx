import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { SunIcon, MoonIcon, UserCircleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // Check if user is admin through any of our mechanisms
  const isAdmin = 
    user?.role === 'admin' || 
    localStorage.getItem('userRole') === 'admin' || 
    localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">SheSafe</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            >
              Home
            </Link>
            {user ? (
              <>
                {user.role === 'user' && (
                  <Link
                    to="/sos"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    SOS
                  </Link>
                )}
                <Link
                  to="/community"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Community
                </Link>
                <Link
                  to="/report-incident"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Report Incident
                </Link>
                {/* Admin Panel Link - Displayed prominently when user is admin */}
                {isAdmin && (
                  <Link
                    to="/admin-access"
                    className="flex items-center px-4 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <ShieldExclamationIcon className="h-4 w-4 mr-1" />
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* User Menu */}
            {user && (
              <Menu as="div" className="relative">
                <Menu.Button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <UserCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-700' : ''
                            } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      {/* Admin Panel Link in dropdown menu */}
                      {isAdmin && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin-access"
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-700' : ''
                              } block px-4 py-2 text-sm text-red-600 dark:text-red-400 font-medium`}
                            >
                              Admin Panel
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-700' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 