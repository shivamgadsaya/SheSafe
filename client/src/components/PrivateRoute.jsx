import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminAuthDebug from '../utils/AdminAuthDebug';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const storedRole = localStorage.getItem('userRole');
  const tokenExists = localStorage.getItem('token');
  const isAdminFlag = localStorage.getItem('isAdmin');
  
  // Special handling for admin routes
  const isAdminRoute = roles.includes('admin');
  const isExplicitAdmin = (user?.role === 'admin') || (storedRole === 'admin') || (isAdminFlag === 'true');
  const isAdminDebugMode = AdminAuthDebug.isAdminDebugModeActive();
  
  // Special handling for admin token
  const isAdminToken = tokenExists === 'shesafe-admin-token-secure-123';
  
  // Check for admin path specifically
  const isAdminPath = location.pathname.startsWith('/admin');
  
  // Debug logging with minimal info
  if (isAdminPath || isAdminRoute) {
    console.log("Admin route check:", {
      path: location.pathname,
      isAdmin: isExplicitAdmin,
      debugMode: isAdminDebugMode,
      hasAdminToken: isAdminToken
    });
  }
  
  // Bypass all checks for admin debug mode
  if (isAdminDebugMode && isAdminRoute) {
    console.log("Admin debug mode active - granting immediate access");
    return children;
  }
  
  // Skip loading for admin routes with admin token
  if (loading && !(isAdminRoute && isAdminToken)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Admin route access check - direct check first
  if (isAdminRoute) {
    // Fast path - if we have the admin token, grant access immediately
    if (isAdminToken) {
      console.log("Admin token detected - granting immediate access");
      return children;
    }
    
    // Admin flag check
    if (isExplicitAdmin) {
      console.log("Admin role verified - granting access");
      return children;
    }
    
    // Not admin, redirect to dashboard or login
    console.log("Not admin - redirecting from admin area");
    return <Navigate to={tokenExists ? "/dashboard" : "/login"} replace />;
  }
  
  // Handle non-admin routes
  
  // If no token at all, redirect to login
  if (!tokenExists) {
    const returnUrl = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }
  
  // For role-specific routes, check user roles
  if (roles.length > 0 && user) {
    const hasRequiredRole = roles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // Redirect logged in users away from login page
  if (user && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  // Default case - grant access
  return children;
};

export default PrivateRoute; 