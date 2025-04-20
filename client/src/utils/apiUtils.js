import axios from 'axios';

// Create API client with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Keep track of failed endpoints to avoid spamming
const failedEndpoints = new Set();
let serverAvailable = true;
let retryTimeout = null;

// Helper function to check if this is an admin login attempt
const isAdminLoginRequest = (config) => {
  // Check if this is a POST request to /auth/login
  if (config.url === '/auth/login' && config.method === 'post' && config.data) {
    // Try to parse the data if it's a string
    let data = config.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // Not valid JSON, can't be our admin login
        return false;
      }
    }
    
    // Normalize the email for checking
    const email = data.email?.trim().toLowerCase();
    
    // Check if the email is one of our admin emails
    return email === 'admin@shesafe.gmail.com' || email === 'admin@shesafe.com';
  }
  return false;
};

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    // Skip if server is known to be unavailable
    if (!serverAvailable && !config.ignoreServerStatus) {
      return Promise.reject(new Error('Server currently unavailable'));
    }
    
    // SPECIAL CASE: Intercept admin login attempts and prevent them from reaching the server
    if (isAdminLoginRequest(config)) {
      console.log('Intercepting admin login request - preventing API call');
      
      // Create a canceled request that never actually sends
      const cancelToken = axios.CancelToken.source();
      config.cancelToken = cancelToken.token;
      
      // Cancel the request immediately
      setTimeout(() => {
        cancelToken.cancel('Admin login should not reach the server');
      }, 0);
      
      return config;
    }
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    // Mark server as available on successful response
    serverAvailable = true;
    return response;
  },
  error => {
    // Special handling for canceled admin login requests
    if (axios.isCancel(error) && error.message === 'Admin login should not reach the server') {
      console.log('Admin login request was intercepted as expected');
      
      // Return a fake 401 response to trigger the fallback to direct admin login
      return Promise.reject({
        response: {
          status: 401,
          data: { message: 'Admin login not authorized via API' }
        },
        message: 'Request failed with status code 401',
        code: 'ERR_BAD_REQUEST'
      });
    }
    
    // Handle network errors by marking server as unavailable
    if (error.code === 'ECONNABORTED' || 
        error.message === 'Network Error' || 
        !error.response) {
      handleServerUnavailable();
    }
    
    // Track 404 errors for specific endpoints
    if (error.response && error.response.status === 404) {
      const endpoint = error.config.url;
      failedEndpoints.add(endpoint);
      
      // Clean up after some time
      setTimeout(() => {
        failedEndpoints.delete(endpoint);
      }, 60000); // 1 minute
    }
    
    return Promise.reject(error);
  }
);

// Function to handle server unavailability
const handleServerUnavailable = () => {
  serverAvailable = false;
  console.warn('Server appears to be unavailable');
  
  // Clear any existing retry timeout
  if (retryTimeout) {
    clearTimeout(retryTimeout);
  }
  
  // Schedule a check to see if server comes back
  retryTimeout = setTimeout(() => {
    checkServerAvailability();
  }, 10000); // Check again in 10 seconds
};

// Function to check if server is available
const checkServerAvailability = async () => {
  try {
    // Try to ping the server
    await axios.get('/api/health', { 
      timeout: 3000,
      ignoreServerStatus: true 
    });
    serverAvailable = true;
    console.log('Server is now available');
  } catch (error) {
    console.warn('Server still unavailable, will retry later');
    // Schedule another check
    retryTimeout = setTimeout(checkServerAvailability, 10000);
  }
};

// Safe API call function with retry logic
export const safeApiCall = async (endpoint, method, data = null, options = {}) => {
  // SPECIAL CASE: If this is an admin login attempt, use the direct admin login handler
  if (endpoint === '/auth/login' && method.toLowerCase() === 'post' && data?.email) {
    const email = data.email.trim().toLowerCase();
    if (email === 'admin@shesafe.gmail.com' || email === 'admin@shesafe.com') {
      console.warn('Admin login detected in safeApiCall - this should be handled separately');
      
      // Return a failed promise to trigger the fallback in login function
      return Promise.reject({
        response: {
          status: 401,
          data: { message: 'Admin login should use directAdminLogin instead' }
        }
      });
    }
  }
  
  const { maxRetries = 2, retryDelay = 1000 } = options;
  
  // Skip if this endpoint has repeatedly failed with 404
  if (failedEndpoints.has(endpoint)) {
    console.warn(`Skipping call to known failed endpoint: ${endpoint}`);
    return null;
  }
  
  // Skip if server is known to be unavailable
  if (!serverAvailable && !options.ignoreServerStatus) {
    console.warn(`Server unavailable, skipping call to: ${endpoint}`);
    return null;
  }
  
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      switch (method.toLowerCase()) {
        case 'get':
          return await apiClient.get(endpoint, options);
        case 'post':
          return await apiClient.post(endpoint, data, options);
        case 'put':
          return await apiClient.put(endpoint, data, options);
        case 'delete':
          return await apiClient.delete(endpoint, options);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error) {
      // Don't retry 404s
      if (error.response && error.response.status === 404) {
        failedEndpoints.add(endpoint);
        throw error;
      }
      
      // Don't retry auth errors
      if (error.response && error.response.status === 401) {
        throw error;
      }
      
      retries++;
      
      if (retries > maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
    }
  }
};

// Export the client for direct use
export default apiClient; 