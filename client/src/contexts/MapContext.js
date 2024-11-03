// src/contexts/MapContext.js
import React, { createContext, useContext, useState } from 'react';

const MapContext = createContext();

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};

export const MapProvider = ({ children }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [coordinates, setCoordinates] = useState();

  const centerMap = (coords) => {
    if (mapInstance) {
      mapInstance.panTo(coords);
      mapInstance.setZoom(14);
    }
    setCoordinates(coords);
  };

  return (
    <MapContext.Provider value={{ mapInstance, setMapInstance, coordinates, setCoordinates, centerMap }}>
      {children}
    </MapContext.Provider>
  );
};

export default MapProvider;