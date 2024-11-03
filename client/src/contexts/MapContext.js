// src/contexts/MapContext.js
import React, { createContext, useContext, useState } from 'react';
import calculateZoomFromArea from '../utils/zoomCalc';

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

  const centerMap = (coords, area) => {
    if (mapInstance) {
      mapInstance.panTo(coords);
      if(area == null){
        mapInstance.setZoom(14)
      }else{
        console.log("Area of clicked icon: ", area)
        mapInstance.setZoom(calculateZoomFromArea(area));
      }
      
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