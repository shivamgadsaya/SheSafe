import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminAuthDebug from '../utils/AdminAuthDebug';

/**
 * This component handles redirecting to the admin panel and ensures proper admin authentication
 */
const AdminRedirect = () => {
  const { user, refreshAuth } = useAuth();
  const [status, setStatus] = useState('Checking admin access...');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [adminDetails, setAdminDetails] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Force direct navigation to admin panel if admin flags are present
  useEffect(() => {
    const checkAndRedirect = async () => {
      // Check stored admin values
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      const isAdminFlag = localStorage.getItem('isAdmin');
      const adminDebugMode = localStorage.getItem('adminDebugMode');
      
      // Store values for debugging
      setAdminDetails({
        token: token ? "exists" : "missing",
        userRole,
        isAdminFlag,
        adminDebugMode,
        userObject: user ? JSON.stringify({
          id: user._id,
          role: user.role,
          name: user.name,
          email: user.email ? user.email.substring(0, 3) + '...' : 'none'
        }) : 'no user object',
        path: location.pathname
      });
      
      console.log("AdminRedirect - Quick admin check");
      
      // Immediate check - if we have clear admin indicators, redirect right away
      if ((userRole === 'admin' && isAdminFlag === 'true') || adminDebugMode === 'true') {
        console.log("AdminRedirect - Clear admin indicators found, redirecting immediately");
        navigate('/admin', { replace: true });
        return;
      }
      
      // Otherwise do a more thorough check
      try {
        setStatus('Verifying admin credentials...');
        
        // If admin debug mode is active, redirect right away
        if (AdminAuthDebug.isAdminDebugModeActive()) {
          console.log("Admin debug mode active, redirecting to admin panel");
          setStatus('Admin access verified, redirecting...');
          setIsAdmin(true);
          navigate('/admin', { replace: true });
          return;
        }
        
        // If we have a token but no user, try refreshing auth
        if (token && !user) {
          setStatus('Refreshing authentication...');
          const refreshResult = await refreshAuth();
          console.log("Auth refresh result:", refreshResult);
        }
        
        // Re-check admin status after potential refresh
        if (userRole === 'admin' || isAdminFlag === 'true' || (user && user.role === 'admin')) {
          console.log("Admin credentials verified after refresh");
          setStatus('Admin access verified, redirecting...');
          setIsAdmin(true);
          navigate('/admin', { replace: true });
          return;
        }
        
        // If we get here, user is not admin
        setStatus('Not authorized as admin');
        setError('You do not have admin privileges. Please login with an admin account or use the "Force Admin Access" button below.');
        
      } catch (err) {
        console.error("Error in AdminRedirect:", err);
        setStatus('Authentication error');
        setError('An error occurred while checking admin access. Please try again.');
      }
    };
    
    checkAndRedirect();
  }, [user, refreshAuth, navigate, location.pathname]);
  
  const handleForceAdminAccess = () => {
    try {
      setStatus('Setting up admin debug access...');
      AdminAuthDebug.setupAdminUser();
      // The setupAdminUser function will handle the redirect
    } catch (err) {
      console.error("Error setting up admin debug access:", err);
      setError('Failed to set up admin debug access. Check console for details.');
    }
  };
  
  const handleReturnToLogin = () => {
    // Clear existing auth data to ensure clean login
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
    sessionStorage.removeItem('user');
    
    // Redirect to login
    navigate('/login', { replace: true });
  };
  
  // Show a loading screen while we check admin access
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Admin Access
        </h1>
        
        <div className="mb-4">
          {!error ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">{status}</p>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {isAdmin && (
          <p className="text-green-600 dark:text-green-400 mb-4">
            Access granted! Redirecting to admin panel...
          </p>
        )}
        
        {error && (
          <div className="flex flex-col gap-4 mt-4">
            <button 
              onClick={handleForceAdminAccess}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Force Admin Access
            </button>
            <button
              onClick={handleReturnToLogin}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRedirect; 