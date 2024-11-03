// ControlButtons.jsx
import React from 'react';
import { Plus, Tag, Square } from 'lucide-react';

const ControlButtons = ({
  isDrawingMode,
  points,
  onLocationChange,
  onDrawingStart,
  onSavePlot,
  onCancelDrawing,
  showFieldNames,
  onToggleFieldNames,
  showPlotFill,
  onTogglePlotFill
}) => {
  return (
    <>
      {/* Points notification in top middle */}
      {isDrawingMode && points.length < 3 && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[5]">
          <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded shadow-lg text-red-600 h-10 flex items-center justify-center font-small">
            <span className="flex items-center gap-1">
              <span className="leading-none">Mark at least 3 points</span>
            </span>
          </div>
        </div>
      )}

      {/* Control buttons */}
      <div className="absolute top-20 right-8 z-[5] flex flex-col gap-2">
        <div className="flex gap-2 justify-end">
          <button
            onClick={onTogglePlotFill}
            className={`flex items-center gap-2 justify-center px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all ${
              showPlotFill ? 'bg-primary text-white' : 'bg-white/80 text-gray-700'
            }`}
          >
            Plot Fill
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
              showPlotFill ? 'border-white' : 'border-gray-700'
            }`}>
              {showPlotFill && '✓'}
            </div>
          </button>

          <button
            onClick={onToggleFieldNames}
            className={`flex items-center gap-2 z-[5] justify-center px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all ${
              showFieldNames ? 'bg-primary text-white' : 'bg-white/80 text-gray-700'
            }`}
          >
            <Tag className="h-5 w-5" />
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
              showFieldNames ? 'border-white' : 'border-gray-700'
            }`}>
              {showFieldNames && '✓'}
            </div>
          </button>
          
          {!isDrawingMode ? (
            <button
              onClick={onDrawingStart}
              className="bg-primary backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-40"
            >
              <div className="flex items-center gap-2 justify-center text-text">
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
      </div>
    </>
  );
};

export default ControlButtons;