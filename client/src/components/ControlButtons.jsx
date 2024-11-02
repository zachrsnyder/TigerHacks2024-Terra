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
    <>
    {/* Points notification in top middle */}
    {isDrawingMode && points.length < 3 && (
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded shadow-lg text-red-600 h-10 flex items-center justify-center font-small">
          <span className="flex items-center gap-1">
            <span className="leading-none">Mark at least 3 points</span>
          </span>
        </div>
      </div>
    )}

      {/* Control buttons */}
      <div className="absolute top-20 right-8 z-10 flex flex-col gap-2">
        {!isDrawingMode ? (
          <button
            onClick={onDrawingStart}
            className="bg-primary backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-40"
          >
            <div className="flex items-center gap-2 justify-center">
              <Plus className="h-5 w-5" />
              Add Field
            </div>
          </button>
        ) : (
          <>
            {points.length >= 3 && (
              <button
                onClick={onSavePlot}
                className="bg-green-500 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:bg-green-400 transition-all w-40"
              >
                Save Plot
              </button>
            )}
            <button
              onClick={onCancelDrawing}
              className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-red-500 w-40"
            >
              Cancel Drawing
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ControlButtons;