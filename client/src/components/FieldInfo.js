import React from 'react';
import { X, Trash2 } from 'lucide-react';

const FieldInfo = ({ plot, onClose, onDelete }) => {
  if (!plot) return null;

  // Convert square meters to acres
  const areaInAcres = (plot.area / 4046.86).toFixed(2);

  // Format date strings
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${plot.name}?`)) {
      await onDelete(plot.id);
      onClose();
    }
  };

  return (
    <div className="fixed right-4 top-32 w-80 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{plot.name}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-50 rounded-full transition-colors group"
              title="Delete field"
            >
              <Trash2 className="h-4 w-4 text-gray-500 group-hover:text-red-500" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Area</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">{areaInAcres} acres</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1 text-sm text-gray-900">
                {plot.createdAt ? formatDate(plot.createdAt) : 'N/A'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="mt-1 text-sm text-gray-900">
                {plot.updatedAt ? formatDate(plot.updatedAt) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div
                className={`h-2.5 w-2.5 rounded-full mr-2 ${
                  plot.active ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {plot.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-700 
                        bg-white border border-gray-300 rounded-md
                        hover:bg-gray-50 focus:outline-none focus:ring-2 
                        focus:ring-offset-1 focus:ring-blue-500
                        transition-colors"
              onClick={() => {
                // TODO: Add edit functionality
                console.log('Edit plot:', plot.id);
              }}
            >
              Edit Field
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldInfo;