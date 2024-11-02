// SearchBar.jsx
import React from 'react';
import { Search, Fence } from 'lucide-react';

const SearchBar = ({ 
  currentStep, 
  value, 
  onChange, 
  onSubmit, 
  error 
}) => {
  const isNameStep = currentStep === 'name';
  const placeholder = isNameStep ? "Enter your farm's name" : "Enter your farm's zip code";
  const maxLength = isNameStep ? 50 : 5;

  return (
    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-20">
      <form onSubmit={onSubmit} className="w-full">
        <div className="relative">
          <div className="flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow w-96 h-12 px-4">
            {isNameStep ? (
              <Fence className="text-gray-400 mr-2" size={20} />
            ) : (
              <Search className="text-gray-400 mr-2" size={20} />
            )}
            <input
              type="text"
              value={value}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
              placeholder={placeholder}
              maxLength={maxLength}
            />
          </div>
          {error && (
            <p className="absolute mt-2 text-sm text-red-600 text-center w-full">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;