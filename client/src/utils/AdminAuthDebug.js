/**
 * Admin Authentication Debug Utility
 * 
 * This utility provides admin access debugging functionality
 */

const AdminAuthDebug = {
  /**
   * Sets up admin user credentials for debugging purposes
   */
  setupAdminUser: () => {
    console.log("%c🔧 Setting up admin user for debugging", "color: blue; font-weight: bold; font-size: 14px;");
    
    try {
      // Clear any previous auth state to avoid conflicts
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAdmin');
      sessionStorage.removeItem('user');
      
      // Set admin credentials in localStorage
      localStorage.setItem('token', 'shesafe-admin-token-secure-123');
      localStorage.setItem('userId', 'admin-debug-user');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('isAdmin', 'true');  // Explicitly set admin flag
      
      // Create admin user object
      const adminUser = {
        _id: 'admin-debug-user',
        name: 'Debug Admin',
        email: 'admin@shesafe.gmail.com',
        role: 'admin',
        isVerified: true
      };
      
      // Store in sessionStorage
      sessionStorage.setItem('user', JSON.stringify(adminUser));
      
      // Set a flag to indicate we're in debug mode
      localStorage.setItem('adminDebugMode', 'true');
      
      console.log("%c✅ Admin debug mode activated", "color: green; font-weight: bold;");
      alert("Admin debug mode activated. You now have admin access.");
      
      // Refresh the page to apply changes
      window.location.href = '/admin';
      
      return true;
    } catch (error) {
      console.error("Error setting up admin debug mode:", error);
      alert("Failed to set up admin debug mode. See console for details.");
      return false;
    }
  },
  
  /**
   * Direct admin login without backend authentication
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Object} Result with success/error and user data
   */
  directAdminLogin: (email, password) => {
    console.log('AdminAuthDebug: Attempting direct admin login:', email);
    
    // Validate admin credentials
    if (!email || !password) {
      console.error('AdminAuthDebug: Missing email or password');
      return { success: false, error: 'Email and password are required' };
    }
    
    // Process the email for more flexible matching
    const normalizedEmail = email.trim().toLowerCase();
    const validAdminEmails = ['admin@shesafe.gmail.com', 'admin@shesafe.com'];
    
    // Check for valid admin email and password
    if (!validAdminEmails.includes(normalizedEmail) || password !== 'admin123') {
      console.error('AdminAuthDebug: Invalid admin credentials');
      return { 
        success: false, 
        error: 'Invalid admin credentials. Use admin@shesafe.gmail.com or admin@shesafe.com with password: admin123'
      };
    }
    
    try {
      // Clear any existing auth data first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Create admin user object
      const adminUser = {
        _id: 'admin-local-debug',
        name: 'Admin User',
        email: 'admin@shesafe.gmail.com', // We'll standardize to this email in the stored user
        role: 'admin',
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // Create an admin token
      const adminToken = 'admin-debug-token-' + Date.now();
      
      // Store auth data (respecting rememberMe preference)
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('user', JSON.stringify(adminUser));
      storage.setItem('token', adminToken);
      
      // Set a flag indicating this is a debug admin login
      storage.setItem('isAdminDebug', 'true');
      storage.setItem('adminLoginTime', Date.now().toString());
      
      console.log('AdminAuthDebug: Admin login successful');
      return {
        success: true,
        user: adminUser,
        token: adminToken
      };
    } catch (error) {
      console.error('AdminAuthDebug: Error during admin login', error);
      return {
        success: false,
        error: 'Failed to setup admin user: ' + (error.message || 'Unknown error')
      };
    }
  },
  
  /**
   * Check if admin debug mode is currently active
   * @returns {boolean} True if admin debug mode is active
   */
  isAdminDebugModeActive: () => {
    // Check both storage locations for admin debug flag
    const localFlag = localStorage.getItem('isAdminDebug') === 'true';
    const sessionFlag = sessionStorage.getItem('isAdminDebug') === 'true';
    
    return localFlag || sessionFlag;
  },
  
  /**
   * Clears all admin debug settings
   */
  clearAdminDebugSettings: () => {
    console.log("🧹 Clearing admin settings...");
    
    // Items to clear for admin debugging
    const itemsToClear = [
      'isAdmin',
      'userRole',
      'token',
      'userId',
      'adminDebugMode',
      'adminBypassAPI'
    ];
    
    // Clear each item
    itemsToClear.forEach(item => localStorage.removeItem(item));
    sessionStorage.removeItem('user');
    
    console.log("✅ Admin settings cleared successfully");
    return true;
  },
  
  /**
   * Logs current admin authentication state
   */
  logAuthState: () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const isAdmin = localStorage.getItem('isAdmin');
    const debugMode = localStorage.getItem('adminDebugMode');
    const bypassAPI = localStorage.getItem('adminBypassAPI');
    const userJson = sessionStorage.getItem('user');
    
    console.log("%c--- ADMIN AUTH INFO ---", "color: blue; font-weight: bold;");
    console.log("Token exists:", !!token);
    console.log("Token value:", token ? token.substring(0, 10) + '...' : 'none');
    console.log("User role:", userRole);
    console.log("isAdmin flag:", isAdmin);
    console.log("Debug mode:", debugMode === 'true');
    console.log("API bypass:", bypassAPI === 'true');
    
    // Don't show email/sensitive info in console
    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        console.log("User name:", parsedUser.name);
        console.log("User role:", parsedUser.role);
        console.log("User ID:", parsedUser._id);
      } catch (e) {
        console.log("User object: Invalid format");
      }
    } else {
      console.log("User object: Not found");
    }
    
    console.log("%c---------------------", "color: blue; font-weight: bold;");
    
    return {
      token: !!token,
      tokenValue: token ? token.substring(0, 10) + '...' : 'none',
      userRole,
      isAdmin,
      debugMode: debugMode === 'true',
      bypassAPI: bypassAPI === 'true',
      hasUserObject: !!userJson
    };
  },
  
  /**
   * Reset authentication - maintained for existing functionality
   */
  resetAuth: () => {
    return AdminAuthDebug.clearAdminDebugSettings();
  },
  
  /**
   * Check admin authorization status
   */
  checkAdminAuth: () => {
    const userJson = sessionStorage.getItem('user');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userRole = localStorage.getItem('userRole') === 'admin';
    const debugMode = localStorage.getItem('adminDebugMode') === 'true';
    const bypassAPI = localStorage.getItem('adminBypassAPI') === 'true';
    
    if (debugMode || bypassAPI) {
      console.log("%c✅ Admin debug mode active - full access granted", "color: green; font-weight: bold;");
      return true;
    }
    
    if (isAdmin && userRole) {
      console.log("%c✅ Authenticated as admin via flags", "color: green; font-weight: bold;");
      return true;
    }
    
    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        // Check for either email format
        if ((parsedUser.email === 'admin@shesafe.gmail.com' || 
             parsedUser.email === 'admin@shesafe.com') && 
            parsedUser.role === 'admin') {
          console.log("%c✅ Authenticated as admin via user object", "color: green; font-weight: bold;");
          return true;
        }
      } catch (e) {
        console.error("Error parsing user object:", e);
      }
    }
    
    console.log("%c❌ Not authenticated as admin", "color: red; font-weight: bold;");
    return false;
  },
  
  /**
   * Verify if current user has admin access
   * @returns {boolean} True if user has admin access
   */
  verifyAdminAccess: () => {
    try {
      // Check localStorage first
      let user = localStorage.getItem('user');
      if (!user) {
        // If not in localStorage, check sessionStorage
        user = sessionStorage.getItem('user');
      }
      
      if (!user) return false;
      
      user = JSON.parse(user);
      return user.role === 'admin';
    } catch (error) {
      console.error('AdminAuthDebug: Error verifying admin access', error);
      return false;
    }
  }
};

export default AdminAuthDebug; 