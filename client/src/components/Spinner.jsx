import React from 'react';

export const Spinner = ({ size = 'md', color = 'indigo', className = '' }) => {
  // Map size names to classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  // Map color names to classes
  const colorClasses = {
    indigo: 'text-indigo-600',
    white: 'text-white',
    gray: 'text-gray-600',
    primary: 'text-primary'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colorClasses[color] || colorClasses.indigo;

  return (
    <svg 
      className={`animate-spin ${sizeClass} ${colorClass} ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export default Spinner; 