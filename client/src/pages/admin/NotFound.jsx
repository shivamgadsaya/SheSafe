import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="bg-red-100 dark:bg-red-900/20 p-10 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
          Admin Page Not Found
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          The admin page you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Admin Dashboard
          </button>
          <Link
            to="/"
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminNotFound; 