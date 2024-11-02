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
  const [coordinates, setCoordinates] = useState({ lat: 38.9517, lng: -92.3341 });

  const centerMap = (coords) => {
    if (mapInstance) {
      mapInstance.panTo(coords);
      mapInstance.setZoom(18);
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