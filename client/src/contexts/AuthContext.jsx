import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { safeApiCall } from '../utils/apiUtils';
import AdminAuthDebug from '../utils/AdminAuthDebug';

// Debug function to check token format and validity
const debugToken = (token) => {
  if (!token) return 'No token provided';
  
  try {
    // Just log the first and last few characters for security
    const firstChars = token.substring(0, 10);
    const lastChars = token.substring(token.length - 5);
    return `${firstChars}...${lastChars} (${token.length} chars)`;
  } catch (e) {
    return 'Invalid token format';
  }
};

// Helper to check if the current token is a debug admin token
const isAdminDebugToken = (token) => {
  if (!token) return false;
  return token.includes('admin-debug-token') || 
         token.includes('shesafe-admin-token') || 
         AdminAuthDebug.isAdminDebugModeActive();
};

// Helper to check if this is an admin login
const isAdminEmail = (email) => {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail === 'admin@shesafe.gmail.com' || 
         normalizedEmail === 'admin@shesafe.com';
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    lastChecked: new Date()
  });

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      setNetworkStatus({
        isOnline: true,
        lastChecked: new Date()
      });
      // Try to refresh authentication on reconnection
      if (localStorage.getItem('token')) {
        refreshAuth();
      }
    };

    const handleOffline = () => {
      console.log('Network connection lost');
      setNetworkStatus({
        isOnline: false,
        lastChecked: new Date()
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add axios interceptor to automatically include token in all requests
  useEffect(() => {
    // Add a request interceptor
    const interceptor = apiClient.interceptors.request.use(
      config => {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        // If the token exists, add it to the authorization header
        if (token) {
          // Send token in both formats to ensure compatibility with server middleware
          config.headers['x-auth-token'] = token;
          config.headers.Authorization = `Bearer ${token}`;
          
          // Log debug info (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.log('Request with auth headers:', {
              url: config.url,
              'x-auth-token': 'Set',
              Authorization: 'Bearer Token Set'
            });
          }
        }
        
        return config;
      },
      error => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add a response interceptor to handle common auth errors
    const responseInterceptor = apiClient.interceptors.response.use(
      response => response,
      error => {
        // Log detailed error information
        if (error.response) {
          console.error('API Error:', {
            status: error.response.status,
            url: error.config.url,
            method: error.config.method,
            data: error.response.data
          });
          
          // Handle auth errors
          if (error.response.status === 401) {
            console.log('401 Unauthorized error detected');
            
            // Check if this is an admin debug token before clearing
            const token = localStorage.getItem('token');
            if (isAdminDebugToken(token)) {
              console.log('Admin debug token detected - not clearing credentials despite 401');
              return Promise.reject(error);
            }
            
            // Don't clear token on initial auth check - only on actual protected API calls
            if (!error.config.url.includes('/api/auth/me')) {
              localStorage.removeItem('token');
              sessionStorage.removeItem('user');
              setUser(null);
              setError('Session expired. Please log in again.');
            }
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          // Check if it's a network error
          if (!navigator.onLine) {
            setError('Network error: You appear to be offline. Please check your internet connection.');
          } else {
            setError('Server communication error. Please try again later.');
          }
        } else {
          console.error('Error creating request:', error.message);
          setError(`Request error: ${error.message}`);
        }
        
        return Promise.reject(error);
      }
    );
    
    // Clean up the interceptors when the component unmounts
    return () => {
      apiClient.interceptors.request.eject(interceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user data is stored in sessionStorage to maintain state across page refreshes
  useEffect(() => {
    try {
      // Check localStorage first for persistent login across sessions
      const token = localStorage.getItem('token');
      const storedUser = sessionStorage.getItem('user');
      
      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Restored user session:', parsedUser.name);
        
        // We still want to validate the token with the server in the background
        // This happens in the next useEffect with fetchUser
      } else {
        console.log('No stored session found');
      }
    } catch (e) {
      console.error("Error restoring user session:", e);
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      // We mark as initialized so the next effect can run
      setInitialized(true);
    }
  }, []);

  // Persist user data in sessionStorage whenever it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }, [user]);

  // Debug initial state
  useEffect(() => {
    console.log("AuthContext initialized");
    
    // Check for token
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Token found in localStorage:", debugToken(token));
    } else {
      console.log("No token found in localStorage");
    }
  }, []);

  // Auto-login with token from localStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if there's a token in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log("fetchUser: No token found, skipping API call");
          setLoading(false);
          return;
        }
        
        // Check if this is an admin debug token - skip API call if it is
        if (isAdminDebugToken(token)) {
          console.log("fetchUser: Admin debug token detected - skipping API call");
          
          // Try to use cached user data from sessionStorage or recreate admin user
          const cachedUser = sessionStorage.getItem('user');
          if (cachedUser) {
            try {
              const parsedUser = JSON.parse(cachedUser);
              setUser(parsedUser);
              console.log("fetchUser: Using cached admin user data");
            } catch (parseError) {
              console.error("Error parsing cached user data:", parseError);
              
              // Recreate admin user if parsing fails
              const adminUser = {
                _id: 'admin-local-debug',
                name: 'Admin User',
                email: 'admin@shesafe.gmail.com',
                role: 'admin',
                isVerified: true,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
              };
              
              setUser(adminUser);
              sessionStorage.setItem('user', JSON.stringify(adminUser));
              console.log("fetchUser: Recreated admin user data");
            }
          } else {
            // Recreate admin user if no cached data
            const adminUser = {
              _id: 'admin-local-debug',
              name: 'Admin User',
              email: 'admin@shesafe.gmail.com',
              role: 'admin',
              isVerified: true,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            
            setUser(adminUser);
            sessionStorage.setItem('user', JSON.stringify(adminUser));
            console.log("fetchUser: Created admin user data");
          }
          
          setLoading(false);
          return;
        }
        
        // Only make the API call if we're online
        if (!navigator.onLine) {
          console.log("fetchUser: Offline, using cached user data");
          
          // Try to use cached user data from sessionStorage
          const cachedUser = sessionStorage.getItem('user');
          if (cachedUser) {
            try {
              const parsedUser = JSON.parse(cachedUser);
              setUser(parsedUser);
              console.log("fetchUser: Using cached user data while offline");
            } catch (parseError) {
              console.error("Error parsing cached user data:", parseError);
              sessionStorage.removeItem('user');
            }
          }
          
          setLoading(false);
          return;
        }
        
        console.log("fetchUser: Attempting to get user data with token");
        
        try {
          // Fetch the user data
          const response = await safeApiCall('/auth/me', 'get', null, {
            headers: {
              'x-auth-token': token,
              'Authorization': `Bearer ${token}`
            },
            // Increase timeout for this critical request
            timeout: 15000
          });
          
          if (!response) {
            console.error("fetchUser: Failed to get response from server");
            return;
          }
          
          console.log("fetchUser: User data received:", response.data);
          setUser(response.data);
          
          // Also store in sessionStorage for immediate availability
          sessionStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          // Check if this might be an admin token that's failing API validation
          if (AdminAuthDebug.isAdminDebugModeActive() || token.includes('admin-debug')) {
            console.log("Possible admin debug token failing API validation - preserving session");
            // Don't clear tokens or user data - keep the admin session active
            return;
          }
          
          // If token is invalid or expired, clear auth data and force re-login
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.log('Authentication failed - clearing credentials');
            localStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setUser(null);
            setError('Session expired. Please log in again.');
          } else if (!navigator.onLine) {
            console.log('Network offline, keeping cached user data');
            // If we're offline but have cached user data, don't clear it
            const cachedUser = sessionStorage.getItem('user');
            if (cachedUser) {
              try {
                setUser(JSON.parse(cachedUser));
              } catch (e) {
                sessionStorage.removeItem('user');
              }
            }
          } else {
            console.log('Server error, keeping cached user data if available');
            // For other errors, keep existing user state
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch user data once we've checked for existing sessions
    if (initialized) {
      fetchUser();
    }
  }, [initialized, networkStatus.isOnline]);

  // Helper to check if this is an admin login
  const isAdminLogin = (email) => {
    if (!email) return false;
    const normalizedEmail = email.trim().toLowerCase();
    return normalizedEmail === 'admin@shesafe.gmail.com' || 
           normalizedEmail === 'admin@shesafe.com';
  };

  // Login function
  const login = async (email, password) => {
    // Input validation
    if (!email || !password) {
      setError('Email and password are required');
      return null;
    }
    
    // Debug admin login short-circuit
    if (isAdminLogin(email)) {
      console.log(`Attempting direct admin login for: ${email}`);
      
      // For admin login, use AdminAuthDebug
      try {
        setLoading(true);
        const adminResult = AdminAuthDebug.directAdminLogin(email, password);
        
        if (adminResult && adminResult.success) {
          setUser(adminResult.user);
          setError(null);
          setLoading(false);
          return { user: adminResult.user, token: adminResult.token };
        } else {
          const errorMsg = adminResult?.error || 'Admin login failed. Please verify your credentials.';
          setError(errorMsg);
          return { error: errorMsg };
        }
      } catch (err) {
        setError('Admin login processing failed. Please try again.');
        return { error: 'Admin login processing error' };
      } finally {
        setLoading(false);
      }
    }
    
    // Regular login process for non-admin users
    console.log(`Attempting regular login with email: ${email}`);
    
    try {
      setLoading(true);
      setError(null);

      // Regular login logic
      const response = await safeApiCall('/auth/login', 'post', { email, password });
      
      if (!response) {
        throw new Error('Unable to contact the server. Please check your connection and try again.');
      }
      
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      // Store the token and user ID
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      
      // Also store role for quick access
      if (user.role) {
        localStorage.setItem('userRole', user.role);
        // Set admin flag if user is admin
        if (user.role === 'admin') {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
      }
      
      // Also store in sessionStorage for immediate availability
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // Update auth state
      setUser(user);
      setError(null);
      
      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle case where API is unavailable but admin credentials were used
      if (isAdminLogin(email) && password === 'admin123') {
        console.log("API error, but admin credentials detected - falling back to direct admin login");
        return login(email, password); // Recursively call login to trigger the admin branch
      }
      
      // Handle case where API is unavailable but we still want to allow admin login
      if (!navigator.onLine || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        console.warn('Network appears to be offline, but admin login may still work');
        setError('Server connection error. If you are an admin, you can still login with admin credentials.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we're online
      if (!navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection.');
      }
      
      // Clear any previous tokens first
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      console.log('Attempting to register user:', userData.email);
      
      // Add debug logs
      console.log('Registration API request to:', `${apiClient.defaults.baseURL}/api/auth/register`);
      
      try {
        const response = await safeApiCall('/auth/register', 'post', userData);
        console.log('Registration API response:', response.status);
        
        const { token, user } = response.data;
        
        console.log('Registration successful, token received');
        
        // Save auth token to localStorage for persistent auth
        localStorage.setItem('token', token);
        
        // Save user data to sessionStorage for immediate access
        sessionStorage.setItem('user', JSON.stringify(user));
        
        // Update state
        setUser(user);
        
        return { success: true, user };
      } catch (apiError) {
        console.error('API call error:', apiError);
        
        // Handle network errors more gracefully
        if (!apiError.response) {
          throw new Error('Unable to connect to the server. Please check your network connection.');
        }
        
        throw apiError; // Re-throw to be handled by the outer catch block
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          // If we have structured validation errors, use the first one
          errorMessage = error.response.data.errors[0].msg || errorMessage;
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
        console.error('Registration response error:', error.response.status, error.response.data);
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
        console.error('Registration request error:', error.request);
      } else {
        errorMessage = error.message;
        console.error('Registration general error:', error.message);
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      setLoading(true);
      console.log('Logging out user');
      
      // Clear all auth-related flags and data
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminDebugMode');
      localStorage.removeItem('adminBypassAPI');
      localStorage.removeItem('isAdminDebug');
      sessionStorage.removeItem('user');
      
      // Clear user state
      setUser(null);
      setError(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error', error);
      return { success: false, error: 'Error logging out' };
    } finally {
      setLoading(false);
    }
  };

  // Check if authentication is ready
  const isAuthenticated = !!user;
  
  // Force a re-authentication with the server
  const refreshAuth = async () => {
    try {
      console.log("Refreshing authentication...");
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("No token found, skipping auth refresh");
        return { success: false, message: 'No authentication token' };
      }
      
      // Check if this is an admin debug token - skip API call if it is
      if (isAdminDebugToken(token)) {
        console.log("refreshAuth: Admin debug token detected - skipping API call");
        
        // Try to get admin user from sessionStorage or recreate
        const cachedUser = sessionStorage.getItem('user');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            // Ensure admin role
            if (parsedUser.role !== 'admin') {
              parsedUser.role = 'admin';
              sessionStorage.setItem('user', JSON.stringify(parsedUser));
            }
            setUser(parsedUser);
            console.log("refreshAuth: Using cached admin user data");
            return { success: true, user: parsedUser };
          } catch (parseError) {
            console.error("Error parsing cached user data:", parseError);
          }
        }
        
        // Recreate admin user
        const adminUser = {
          _id: 'admin-local-debug',
          name: 'Admin User',
          email: 'admin@shesafe.gmail.com',
          role: 'admin',
          isVerified: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        setUser(adminUser);
        sessionStorage.setItem('user', JSON.stringify(adminUser));
        console.log("refreshAuth: Recreated admin user data");
        return { success: true, user: adminUser };
      }
      
      // Try to get user data with the existing token
      const response = await safeApiCall('/auth/me', 'get', null, {
        headers: {
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        },
        // Increase timeout for this critical request
        timeout: 15000
      });
      const userData = response.data;
      
      // Store user data
      setUser(userData);
      
      // Update role in localStorage for consistency
      if (userData.role) {
        localStorage.setItem('userRole', userData.role);
        console.log(`Updated user role in localStorage: ${userData.role}`);
        
        // Special handling for admin role
        if (userData.role === 'admin') {
          console.log('Admin role detected during refresh - setting admin flag');
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
      }
      
      // Clear any auth errors
      setError(null);
      
      console.log("Auth refresh successful:", userData.name);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Error refreshing authentication:', error);
      
      // Check if this might be an admin token that's failing API validation
      const token = localStorage.getItem('token');
      if (AdminAuthDebug.isAdminDebugModeActive() || (token && token.includes('admin-debug'))) {
        console.log("Possible admin debug token failing API validation - preserving session");
        // Don't clear tokens or user data - keep the admin session active
        return { success: true, message: 'Admin debug session preserved' };
      }
      
      // Only clear token on specific auth errors
      if (error.response && error.response.status === 401) {
        console.log("Auth token invalid or expired, clearing token");
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAdmin');
        sessionStorage.removeItem('user');
        setUser(null);
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to authenticate' 
      };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're online
      if (!navigator.onLine) {
        const errorMsg = 'You appear to be offline. Please check your internet connection.';
        console.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('Requesting password reset for:', email);
      
      const response = await safeApiCall('/auth/forgot-password', 'post', { email });
      
      if (!response) {
        const errorMsg = 'Unable to contact the server. Please try again later.';
        console.error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      console.log('Password reset response:', response.data);
      
      // If the request was successful, the response should include resetLink, resetToken
      if (response.data.success && response.data.resetLink) {
        return {
          success: true,
          resetLink: response.data.resetLink,
          resetToken: response.data.resetToken,
          expiresAt: response.data.expiresAt,
          alternateLinks: response.data.alternateLinks || {}
        };
      }
      
      // If the server responded but did not include a resetLink
      if (response.data.success) {
        return { success: true };
      }
      
      // If the server explicitly indicates failure
      if (response.data.success === false) {
        return { 
          success: false, 
          error: response.data.message || 'Failed to request password reset.' 
        };
      }
      
      // Fallback success case
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Failed to request password reset. Please try again.';
      
      if (error.response) {
        // Extract error message from response
        errorMessage = error.response.data?.message || errorMessage;
        console.log('Error response data:', error.response.data);
        
        return { 
          success: false, 
          error: errorMessage,
          responseData: error.response.data,
          status: error.response.status
        };
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        errorObj: error.toString()
      };
    } finally {
      setLoading(false);
    }
  };

  // Verify password reset token
  const verifyResetToken = async (token) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're online
      if (!navigator.onLine) {
        console.error('Cannot verify token: offline');
        return { 
          valid: false, 
          error: 'You appear to be offline. Please check your internet connection.' 
        };
      }

      console.log('Verifying password reset token:', token.substring(0, 10) + '...');
      
      const response = await safeApiCall('/auth/verify-reset-token', 'post', { token });
      
      if (!response) {
        console.error('No response from server when verifying token');
        return { 
          valid: false, 
          error: 'Unable to contact the server. Please try again later.' 
        };
      }
      
      console.log('Token verification response:', response.data);
      
      // Handle both standard and success field response formats
      return { 
        valid: response.data.valid,
        message: response.data.message,
        email: response.data.email
      };
    } catch (error) {
      console.error('Token verification error:', error);
      
      let errorMessage = 'Failed to verify reset token. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { 
        valid: false, 
        error: errorMessage,
        errorDetails: error.toString()
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're online
      if (!navigator.onLine) {
        console.error('Cannot reset password: offline');
        return { 
          success: false, 
          error: 'You appear to be offline. Please check your internet connection.' 
        };
      }

      console.log('Resetting password with token:', token.substring(0, 10) + '...');
      
      const response = await safeApiCall('/auth/reset-password', 'post', { 
        token, 
        password: newPassword 
      });
      
      if (!response) {
        console.error('No response from server when resetting password');
        return { 
          success: false, 
          error: 'Unable to contact the server. Please try again later.' 
        };
      }
      
      console.log('Password reset response:', response.data);
      
      // Return the success result directly
      return { 
        success: response.data.success !== false, // Handle both explicit success field and implied success
        message: response.data.message
      };
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        return {
          success: false,
          error: errorMessage,
          status: error.response.status,
          data: error.response.data
        };
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        errorDetails: error.toString()
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    isAuthenticated,
    networkStatus,
    api: apiClient,
    token: localStorage.getItem('token'),
    isAdminUser: user?.role === 'admin' || AdminAuthDebug.isAdminDebugModeActive(),
    forgotPassword,
    verifyResetToken,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add explicit isAuthenticated property based on user presence
  return {
    ...context,
    isAuthenticated: !!context.user
  };
};