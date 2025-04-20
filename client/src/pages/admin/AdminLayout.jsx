import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const { user, isAuthenticated, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState({});
  
  // Additional admin authentication check
  useEffect(() => {
    const checkAdminAuth = async () => {
      // Get admin info for debugging
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      const isAdminFlag = localStorage.getItem('isAdmin');
      
      setAdminInfo({
        token: token ? "exists" : "missing",
        userRole,
        isAdminFlag,
        userObject: user ? JSON.stringify(user) : "null",
        pathname: location.pathname
      });
      
      console.log("AdminLayout - Checking admin authentication");
      console.log("AdminLayout - Current path:", location.pathname);
      console.log("AdminLayout - User:", user);
      console.log("AdminLayout - isAuthenticated:", isAuthenticated);
      console.log("AdminLayout - User role:", user?.role);
      console.log("AdminLayout - Stored role:", localStorage.getItem('userRole'));
      console.log("AdminLayout - Token exists:", !!localStorage.getItem('token'));
      
      // If we don't have user data but token exists, try to refresh auth
      if ((!user || !user.role) && token) {
        console.log("AdminLayout - Token exists but no user data, trying to refresh auth");
        try {
          await refreshAuth();
          // refreshAuth should update the user state if successful
        } catch (err) {
          console.error("AdminLayout - Error refreshing auth:", err);
        }
      }
      
      // Verify admin access
      const storedRole = localStorage.getItem('userRole');
      const isAdmin = (user?.role === 'admin') || (storedRole === 'admin') || (isAdminFlag === 'true');
      
      if (!isAdmin) {
        console.log("AdminLayout - Not authenticated as admin, redirecting");
        navigate('/login?returnUrl=/admin', { replace: true });
      } else {
        console.log("AdminLayout - Admin authentication confirmed");
        setIsLoading(false);
      }
    };
    
    checkAdminAuth();
  }, [user, isAuthenticated, navigate, refreshAuth, location.pathname]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Admin Banner */}
      <div className="bg-red-600 text-white py-1 px-4 text-center">
        <strong>ADMIN MODE</strong> - You are logged in as an administrator
      </div>
      
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 