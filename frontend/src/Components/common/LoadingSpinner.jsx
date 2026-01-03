// src/components/Common/LoadingSpinner.jsx
import React from "react";
const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin`} />
      {text && <p className="mt-4 text-gray-400 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;