// ControlButtons.jsx
import React from 'react';

const ControlButtons = ({ 
  isDrawingMode, 
  points, 
  onLocationChange, 
  onDrawingStart, 
  onSavePlot, 
  onCancelDrawing 
}) => {
  return (
    <div className="absolute bottom-8 right-8 z-10 space-y-2">
      {/* <button
        onClick={onLocationChange}
        className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
      >
        Change Location
      </button> */}
      {!isDrawingMode ? (
        <button
          onClick={onDrawingStart}
          className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all mr-8"
        >
          Draw New Plot
        </button>
      ) : (
        <>
          {points.length >= 3 ? (
            <button
              onClick={onSavePlot}
              className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
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
            className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
          >
            Cancel Drawing
          </button>
        </>
      )}
    </div>
  );
};

export default ControlButtons;