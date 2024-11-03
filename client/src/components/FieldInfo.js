import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, Edit2, Loader } from 'lucide-react';

const FieldInfo = ({ plot, onClose, onDelete, onUpdate, onStartShapeEdit }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlot, setEditedPlot] = useState(plot);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [soilData, setSoilData] = useState(null);
  const [isLoadingSoil, setIsLoadingSoil] = useState(false);
  const [soilError, setSoilError] = useState(null);

  useEffect(() => {
    setEditedPlot(plot);
    fetchSoilData();
  }, [plot]);

  const fetchSoilData = async () => {
    if (!plot.center) return;
    
    setIsLoadingSoil(true);
    setSoilError(null);
    
    try {
      const lon = parseFloat(plot.center[1]).toFixed(6);
      const lat = parseFloat(plot.center[0]).toFixed(6);
      
      const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lat=${lat}&lon=${lon}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });
  
      const data = await response.json();
      
      // Find the relevant layers by name
      const layers = data.properties.layers;
      const clayLayer = layers.find(layer => layer.name === 'clay');
      const sandLayer = layers.find(layer => layer.name === 'sand');
      const carbonLayer = layers.find(layer => layer.name === 'ocd');
      const pHLayer = layers.find(layer => layer.name === 'phh2o');
  
      // Convert values to proper units
      // Clay and sand are given in g/kg, convert to percentage (divide by 10)
      // pH is given in pH * 10, so divide by 10
      // Organic carbon is in g/kg
      const processedData = {
        clay: (clayLayer?.depths?.[0]?.values?.mean || 0) / 10,
        sand: (sandLayer?.depths?.[0]?.values?.mean || 0) / 10,
        organicCarbon: carbonLayer?.depths?.[0]?.values?.mean || 0,
        pH: (pHLayer?.depths?.[0]?.values?.mean || 0) / 10
      };
  
      console.log('Raw Layer values:', {
        clay: clayLayer?.depths?.[0]?.values?.mean,
        sand: sandLayer?.depths?.[0]?.values?.mean,
        carbon: carbonLayer?.depths?.[0]?.values?.mean,
        pH: pHLayer?.depths?.[0]?.values?.mean
      });
  
      console.log('Processed Data:', processedData);
      
      const analysis = analyzeSoilData(processedData);
      setSoilData(analysis);
    } catch (error) {
      console.error('Error fetching soil data:', error);
      setSoilError('Failed to load soil data: ' + error.message);
    } finally {
      setIsLoadingSoil(false);
    }
  };

  const analyzeSoilData = (soilData) => {
    console.log('Raw soil data for analysis:', soilData);
    
    const scoreRanges = {
        organicCarbon: {
          5: [40, 100],    // g/kg
          4: [30, 39.9],
          3: [20, 29.9],
          2: [10, 19.9],
          1: [0, 9.9]
        },
        pH: {
          5: [6.0, 7.0],   // pH scale
          4: [5.5, 5.9],
          3: [7.1, 7.5],
          2: [5.0, 5.4],
          1: [0, 4.9]
        },
        clay: {            // Now in percentage
          5: [30, 35],
          4: [25, 29.9],
          3: [20, 24.9],
          2: [15, 19.9],
          1: [0, 14.9]
        },
        sand: {            // Now in percentage
          5: [30, 35],
          4: [25, 29.9],
          3: [20, 24.9],
          2: [15, 19.9],
          1: [0, 14.9]
        }
      };
  
    const mapToScore = (value, ranges) => {
      for (let score = 5; score >= 1; score--) {
        const [min, max] = ranges[score];
        if (value >= min && value <= max) return score;
      }
      return 1; // Default to lowest score if out of all ranges
    };
  
    const scores = {
      organicCarbon: mapToScore(soilData.organicCarbon, scoreRanges.organicCarbon),
      pH: mapToScore(soilData.pH, scoreRanges.pH),
      clay: mapToScore(soilData.clay, scoreRanges.clay),
      sand: mapToScore(soilData.sand, scoreRanges.sand)
    };
  
    console.log('Individual scores:', scores);
  
    const weights = {
      organicCarbon: 0.35,
      pH: 0.25,
      clay: 0.20,
      sand: 0.20
    };
  
    console.log('Calculating weighted scores:');
    Object.entries(scores).forEach(([key, score]) => {
      console.log(`${key}: ${score} * ${weights[key]} * 20 = ${score * weights[key] * 20}`);
    });
  
    const overallScore = Math.round(
      Object.entries(scores).reduce((total, [key, score]) => {
        return total + (score * weights[key] * 20);
      }, 0)
    );
  
    console.log('Final overall score:', overallScore);
  
    // Generate interpretations for each component
    const interpretations = {
      organicCarbon: getOrganicCarbonInterpretation(soilData.organicCarbon),
      pH: getPHInterpretation(soilData.pH),
      clay: getClayInterpretation(soilData.clay),
      sand: getSandInterpretation(soilData.sand)
    };
  
    return {
      clay: `${soilData.clay.toFixed(1)}%`,
      sand: `${soilData.sand.toFixed(1)}%`,
      organicCarbon: `${soilData.organicCarbon.toFixed(1)} g/kg`,
      pH: soilData.pH.toFixed(1),
      quality: getOverallQuality(overallScore),
      interpretations,
      score: overallScore
    };
  };
  
  const getOrganicCarbonInterpretation = (value) => {
    if (value >= 400) return "Very high - Excellent soil fertility";
    if (value >= 300) return "High - Good soil fertility";
    if (value >= 200) return "Medium - Moderate soil fertility";
    if (value >= 100) return "Low - May need organic matter";
    return "Very low - Needs organic matter amendment";
  };
  
  const getPHInterpretation = (value) => {
    if (value >= 7.5) return "Alkaline - May restrict nutrient availability";
    if (value >= 7.0) return "Slightly alkaline - Generally good for most crops";
    if (value >= 6.0) return "Optimal - Ideal for most crops";
    if (value >= 5.5) return "Slightly acidic - Still good for most crops";
    if (value >= 5.0) return "Acidic - May need lime amendment";
    return "Very acidic - Needs lime amendment";
  };
  
  const getClayInterpretation = (value) => {
    if (value >= 150) return "Very high - May have drainage issues";
    if (value >= 100) return "High - Good water retention";
    if (value >= 50) return "Medium - Balanced properties";
    if (value >= 25) return "Low - May need water management";
    return "Very low - Poor water retention";
  };
  
  const getSandInterpretation = (value) => {
    if (value >= 150) return "Very high - May have water retention issues";
    if (value >= 100) return "High - Good drainage";
    if (value >= 50) return "Medium - Balanced properties";
    if (value >= 25) return "Low - Good water retention";
    return "Very low - May have drainage issues";
  };
  
  const getOverallQuality = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Moderate";
    return "Poor";
  };

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
                <div className="absolute z-10 top-full -left-20 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px]">
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-600">Select plot color</p>
                    <div className="grid grid-cols-4 gap-3">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className="w-10 h-10 rounded hover:scale-105 transition-transform duration-200 shadow-sm hover:shadow-md"
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
          
          <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Soil Composition</h3>
          {isLoadingSoil ? (
            <div className="flex items-center justify-center py-2">
              <Loader className="h-5 w-5 text-gray-400 animate-spin" />
            </div>
          ) : soilError ? (
            <div>
              <p className="text-sm text-red-500">{soilError}</p>
              <button 
                onClick={fetchSoilData}
                className="text-xs text-blue-500 hover:text-blue-600 mt-2"
              >
                Try Again
              </button>
            </div>
          ) : soilData ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Clay Content</p>
                  <p className="text-sm font-medium">{soilData.clay}</p>
                  <p className="text-xs text-gray-400">{soilData.interpretations?.clay || ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sand Content</p>
                  <p className="text-sm font-medium">{soilData.sand}</p>
                  <p className="text-xs text-gray-400">{soilData.interpretations?.sand || ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Organic Carbon</p>
                  <p className="text-sm font-medium">{soilData.organicCarbon}</p>
                  <p className="text-xs text-gray-400">{soilData.interpretations?.organicCarbon || ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">pH Level</p>
                  <p className="text-sm font-medium">{soilData.pH}</p>
                  <p className="text-xs text-gray-400">{soilData.interpretations?.pH || ''}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600">
                  Overall Quality: <span className="text-gray-900">{soilData.quality || 'Unknown'}</span>
                </p>
              </div>
              <button 
                onClick={fetchSoilData}
                className="text-xs text-blue-500 hover:text-blue-600 mt-2"
              >
                Refresh Soil Data
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No soil data available</p>
          )}
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