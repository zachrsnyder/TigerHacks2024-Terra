import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, Edit2 } from 'lucide-react';

const FieldInfo = ({ plot, onClose, onDelete, onUpdate, onStartShapeEdit }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlot, setEditedPlot] = useState(plot);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Predefined colors for the color picker
  const colors = [
    '#4CAF50', '#66BB6A', '#81C784', '#2196F3', '#42A5F5', 
    '#F44336', '#EF5350', '#FFC107', '#FFCA28', '#9C27B0'
  ];

  // Close color picker when clicking outside - moved to top level
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorPicker && !event.target.closest('.color-picker-container')) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  if (!plot) return null;

  // Rest of the component functionality
  const areaInAcres = (plot.area / 5446.86).toFixed(2);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }
    await onDelete(plot.id);
    onClose();
  };

  const handleUpdate = async () => {
    await onUpdate(plot.id, {
      ...editedPlot,
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPlot(plot);
    setIsEditing(false);
  };

  const handleEditShape = () => {
    onStartShapeEdit(plot);
    onClose();
  };

  const handleColorChange = (color) => {
    setEditedPlot({ ...editedPlot, color });
    setShowColorPicker(false);
    if (!isEditing) {
      onUpdate(plot.id, {
        ...plot,
        color,
        updatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="fixed right-4 top-32 w-80 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <input
                type="text"
                value={editedPlot.name}
                onChange={(e) => setEditedPlot({ ...editedPlot, name: e.target.value })}
                className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900">{plot.name}</h2>
            )}
            <div className="relative color-picker-container">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-6 h-6 rounded border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: editedPlot.color || '#4CAF50' }}
                aria-label="Change plot color"
              />
              {showColorPicker && (
                <div className="absolute z-10 top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-600 mb-1">Select plot color</p>
                    <div className="grid grid-cols-5 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className="w-8 h-8 rounded-full hover:scale-110 transition-transform duration-200 shadow-sm hover:shadow-md"
                          style={{ 
                            backgroundColor: color,
                            border: editedPlot.color === color ? '2px solid #000' : '1px solid #e5e7eb'
                          }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <div className="relative overflow-hidden">
                <button
                  onClick={handleDelete}
                  className={`flex items-center gap-1 py-1.5 px-2 rounded-full transition-all duration-200 ${
                    isConfirmingDelete 
                      ? 'bg-red-50 text-red-500 pr-20' 
                      : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className={`text-sm whitespace-nowrap absolute left-7 transition-opacity duration-200 ${
                    isConfirmingDelete ? 'opacity-100' : 'opacity-0'
                  }`}>
                    Confirm?
                  </span>
                </button>
              </div>
            )}
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
              {isEditing ? (
                <button
                  onClick={() => setEditedPlot({ ...editedPlot, active: !editedPlot.active })}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      editedPlot.active ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {editedPlot.active ? 'Active' : 'Inactive'}
                  </span>
                </button>
              ) : (
                <>
                  <div
                    className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      plot.active ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {plot.active ? 'Active' : 'Inactive'}
                  </span>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 
                              bg-white border border-gray-300 rounded-md
                              hover:bg-gray-50 focus:outline-none focus:ring-2 
                              focus:ring-offset-1 focus:ring-blue-500
                              transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-3 py-1.5 text-sm font-medium text-white
                              bg-blue-500 rounded-md hover:bg-blue-600 
                              focus:outline-none focus:ring-2 focus:ring-offset-1 
                              focus:ring-blue-500 transition-colors"
                  >
                    Save
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 
                              bg-white border border-gray-300 rounded-md
                              hover:bg-gray-50 focus:outline-none focus:ring-2 
                              focus:ring-offset-1 focus:ring-blue-500
                              transition-colors"
                  >
                    Edit Info
                  </button>
                  <button
                    onClick={handleEditShape}
                    className="px-3 py-1.5 text-sm font-medium text-white
                              bg-blue-500 rounded-md hover:bg-blue-600 
                              focus:outline-none focus:ring-2 focus:ring-offset-1 
                              focus:ring-red-500 transition-colors"
                  >
                    Edit Shape
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldInfo;