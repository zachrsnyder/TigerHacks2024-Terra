import React from 'react';

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
      {error}
    </div>
  );
};

export default ErrorMessage;