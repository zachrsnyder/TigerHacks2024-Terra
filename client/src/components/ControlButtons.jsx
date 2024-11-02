// ControlButtons.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const ControlButtons = ({ 
  isDrawingMode, 
  points, 
  onLocationChange, 
  onDrawingStart, 
  onSavePlot, 
  onCancelDrawing 
}) => {
  return (
    <div className="absolute top-20 right-0 z-10 space-y-2">
      {/* <button
        onClick={onLocationChange}
        className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
      >
        Change Location
      </button> */}
      {!isDrawingMode ? (
        <button
          onClick={onDrawingStart}
          className="bg-primary backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all mr-8"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Field
          </div>
        </button>
      ) : (
        <>
          {points.length >= 3 ? (
            <button
              onClick={onSavePlot}
              className="bg-primary backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
            >
              Save Plot
            </button>
          ) : (
            <button
              className="bg-gray-300 px-4 py-2 rounded-full shadow-lg w-full cursor-not-allowed"
              disabled
            >
              Mark at least 3 points
            </button>
          )}
          <button
            onClick={onCancelDrawing}
            className="bg-red-400 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full hover:bg-red-600"
          >
            Cancel Drawing
          </button>
        </>
      )}
    </div>
  );
};

export default ControlButtons;