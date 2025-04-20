import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  UserPlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Add import for loading spinner component
import Spinner from '../../components/Spinner';

const UsersManagement = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false); // Separate loading state for form operations
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, you would fetch real data from the API
      // const response = await api.get('/api/admin/users');
      
      // Using mock data for now
      const mockUsers = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '+1 (555) 123-4567',
          role: 'user',
          status: 'active',
          createdAt: '2023-09-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Emma Wilson',
          email: 'emma.w@example.com',
          phone: '+1 (555) 987-6543',
          role: 'user',
          status: 'active',
          createdAt: '2023-10-05T14:20:00Z'
        },
        {
          id: '3',
          name: 'Michael Chen',
          email: 'michael.c@example.com',
          phone: '+1 (555) 456-7890',
          role: 'guardian',
          status: 'active',
          createdAt: '2023-08-22T09:15:00Z'
        },
        {
          id: '4',
          name: 'Jessica Taylor',
          email: 'jessica.t@example.com',
          phone: '+1 (555) 789-0123',
          role: 'user',
          status: 'inactive',
          createdAt: '2023-07-11T16:45:00Z'
        },
        {
          id: '5',
          name: 'David Brown',
          email: 'david.b@example.com',
          phone: '+1 (555) 234-5678',
          role: 'responder',
          status: 'active',
          createdAt: '2023-11-02T11:10:00Z'
        }
      ];
      
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 500); // Simulate API delay
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleEditUser = (user) => {
    setError(null); // Clear any previous errors
    setSelectedUser({...user}); // Create a copy to avoid reference issues
    setShowUserModal(true);
  };
  
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setConfirmDelete(true);
  };
  
  const confirmUserDelete = async () => {
    try {
      setFormLoading(true);
      // In a real implementation, you would call the API
      // await api.delete(`/api/admin/users/${selectedUser.id}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setConfirmDelete(false);
      setSelectedUser(null);
      
      // Show success message
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };
  
  const cancelDelete = () => {
    setConfirmDelete(false);
    setSelectedUser(null);
  };
  
  const closeUserModal = () => {
    setError(null); // Clear errors when closing
    setShowUserModal(false);
    setSelectedUser(null);
  };
  
  const saveUser = async (userData) => {
    try {
      // Start loading state
      setFormLoading(true);
      setError(null); // Clear any previous error
      
      if (selectedUser) {
        // Update existing user
        console.log('Updating user:', selectedUser.id, userData);
        
        // In a real implementation, you would call the API
        try {
          // await api.put(`/api/admin/users/${selectedUser.id}`, userData);
          // For demo, simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update local state
          setUsers(users.map(user => 
            user.id === selectedUser.id ? { ...user, ...userData } : user
          ));
          
          // Show success message
          alert('User updated successfully');
          
          // Close modal after successful save
          closeUserModal();
        } catch (apiError) {
          console.error('API error updating user:', apiError);
          setError('Failed to update user. Please try again.');
          throw apiError; // Re-throw to handle in outer catch
        }
      } else {
        // Create new user
        console.log('Creating new user:', userData);
        
        try {
          // In a real implementation, you would call the API
          // const response = await api.post('/api/admin/users', userData);
          // For demo, simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Add to local state with a mock ID
          const newUser = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString()
          };
          
          setUsers([newUser, ...users]);
          
          // Show success message
          alert('User added successfully');
          
          // Close modal after successful save
          closeUserModal();
        } catch (apiError) {
          console.error('API error creating user:', apiError);
          setError('Failed to create user. Please try again.');
          throw apiError; // Re-throw to handle in outer catch
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      // Error already handled in inner catch blocks
    } finally {
      setFormLoading(false);
    }
  };
  
  const filteredUsers = searchTerm 
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;
    
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'guardian':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'responder':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
  
  const getStatusBadgeClass = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              setSelectedUser(null);
              setShowUserModal(true);
            }}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            disabled={formLoading}
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Add User
          </button>
          <button 
            onClick={fetchUsers}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={loading}
          >
            {loading ? (
              <Spinner size="sm" color="primary" />
            ) : (
              <ArrowPathIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="search"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex justify-center">
                      <Spinner size="lg" color="primary" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading users...</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="inline-flex items-center text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 px-2 py-1 rounded-md mr-3 transition-colors"
                          disabled={formLoading}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="inline-flex items-center text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 px-2 py-1 rounded-md transition-colors"
                          disabled={formLoading}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete user <span className="font-semibold">{selectedUser?.name}</span>? This action cannot be undone.
            </p>
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmUserDelete}
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <Spinner size="sm" color="white" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* User Form Modal - Complete implementation */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                type="button"
                onClick={closeUserModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                disabled={formLoading}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                role: formData.get('role'),
                status: formData.get('status')
              };
              saveUser(userData);
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={selectedUser?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Enter full name"
                    disabled={formLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    defaultValue={selectedUser?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="email@example.com"
                    disabled={formLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    required
                    defaultValue={selectedUser?.phone || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="+1 (555) 555-5555"
                    disabled={formLoading}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      id="role"
                      required
                      defaultValue={selectedUser?.role || 'user'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                      disabled={formLoading}
                    >
                      <option value="user">User</option>
                      <option value="guardian">Guardian</option>
                      <option value="responder">Responder</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      required
                      defaultValue={selectedUser?.status || 'active'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                      disabled={formLoading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeUserModal}
                  disabled={formLoading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <Spinner size="sm" color="white" className="mr-2" />
                      {selectedUser ? 'Saving...' : 'Adding...'}
                    </>
                  ) : (
                    selectedUser ? 'Save Changes' : 'Add User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement; 