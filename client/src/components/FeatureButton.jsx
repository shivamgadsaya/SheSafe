import React from 'react';
import { Link } from 'react-router-dom';

const FeatureButton = ({ icon, title, description, to, color }) => {
  return (
    <Link 
      to={to}
      className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft hover:shadow-medium transition-all hover:-translate-y-1 border-l-4 ${color}`}
    >
      <div className="flex items-start">
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-')}/10 mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default FeatureButton; 