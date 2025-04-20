import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/Spinner';
import AdminAuthDebug from '../utils/AdminAuthDebug';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading, error, isAuthenticated, networkStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from query parameter or default to dashboard
  const getReturnUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl');
    return returnUrl ? decodeURIComponent(returnUrl) : "/dashboard";
  };
  
  const from = getReturnUrl();

  // If user is already authenticated, redirect to intended destination or dashboard
  useEffect(() => {
    if (isAuthenticated && !isSubmitting) {
      console.log('User is authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, isSubmitting, from]);

  // Set error from AuthContext if available
  useEffect(() => {
    if (error) {
      setFormErrors({ auth: error });
    }
  }, [error]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Clear general auth error when user starts typing
    if (formErrors.auth && (name === 'email' || name === 'password')) {
      setFormErrors({
        ...formErrors,
        auth: ''
      });
    }
  };

  // Check if the user is attempting to log in as admin
  const isAdminLoginAttempt = () => {
    const email = formData.email.trim().toLowerCase();
    return email === 'admin@shesafe.gmail.com' || email === 'admin@shesafe.com';
  };

  // Handle direct admin login with AdminAuthDebug
  const handleDirectAdminLogin = async () => {
    // Only proceed if admin credentials are correct
    if (formData.password !== 'admin123') {
      setFormErrors({ auth: 'Invalid admin password. Admin password is admin123.' });
      return false;
    }
    
    console.log('Using direct admin login method');
    try {
      // Use direct admin login from AdminAuthDebug
      const adminLoginResult = AdminAuthDebug.directAdminLogin(
        formData.email.trim(),
        formData.password,
        formData.rememberMe
      );
      
      if (adminLoginResult && adminLoginResult.success) {
        console.log('Admin login successful, redirecting to admin dashboard');
        navigate('/admin', { replace: true });
        return true;
      } else {
        console.error('Direct admin login failed');
        setFormErrors({ auth: adminLoginResult?.error || 'Admin login failed. Please try again.' });
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setFormErrors({ auth: 'An error occurred during admin login. Please try again.' });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setFormErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store the remember me preference
      localStorage.setItem('rememberMe', formData.rememberMe);
      
      // ALWAYS handle admin login attempt via direct method
      if (isAdminLoginAttempt()) {
        await handleDirectAdminLogin();
        setIsSubmitting(false);
        return; // Exit early regardless of result (errors are already handled)
      }
      
      // For offline users, prevent login attempts
      if (!networkStatus.isOnline) {
        setFormErrors({ 
          auth: 'You are offline. Only admin login is available offline. Use email: admin@shesafe.gmail.com and password: admin123'
        });
        setIsSubmitting(false);
        return;
      }
      
      // Regular login flow for non-admin users
      console.log('Attempting regular login with email:', formData.email);
      const result = await login(formData.email, formData.password);
      
      if (result && result.user) {
        console.log('Login successful, user role:', result.user.role);
        navigate(from, { replace: true });
      } else {
        // Login failed with a returned error message
        setFormErrors({ auth: result?.error || 'Login failed. Please try again.' });
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Check if this is a 401 error that might be better handled by direct admin login
      if (err.response?.status === 401 && isAdminLoginAttempt()) {
        console.log('API authentication failed for admin, trying direct login...');
        await handleDirectAdminLogin();
        setIsSubmitting(false);
        return;
      }
      
      // Handle specific error types
      if (err.response) {
        if (err.response.status === 401) {
          setFormErrors({ auth: 'Invalid email or password. Please try again.' });
        } else if (err.response.status === 403) {
          setFormErrors({ auth: 'Your account has been suspended. Please contact support.' });
        } else if (err.response.data?.message) {
          setFormErrors({ auth: err.response.data.message });
        } else {
          setFormErrors({ auth: `Server error (${err.response.status}). Please try again later.` });
        }
      } else if (err.request && !networkStatus.isOnline) {
        setFormErrors({ 
          auth: 'Connection error. Try admin login with email: admin@shesafe.gmail.com and password: admin123'
        });
      } else {
        setFormErrors({ auth: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Sign in to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {formErrors.auth && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-300">{formErrors.auth}</p>
                  </div>
                </div>
              </div>
            )}
            
            {!networkStatus.isOnline && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>You are currently offline.</strong> Only admin login with <br/>
                      Email: <strong>admin@shesafe.gmail.com</strong><br/>
                      Password: <strong>admin123</strong><br/>
                      will work.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                  value={formData.password}
                  onChange={handleChange}
                />
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 