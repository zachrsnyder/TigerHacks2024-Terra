import React from 'react';
import { Fence } from 'lucide-react';

//Component that renders the input field for the plot name
const PlotNameInput = ({ value, onChange, onSubmit }) => {
  return (
    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-20">
      <form onSubmit={onSubmit} className="w-full">
        <div className="relative">
          <div className="flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow w-96 h-12 px-4">
            <Fence className="text-gray-400 mr-2" size={20} />
            <input
              type="text"
              value={value}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
              placeholder="Enter plot name"
              maxLength={50}
              autoFocus
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlotNameInput;