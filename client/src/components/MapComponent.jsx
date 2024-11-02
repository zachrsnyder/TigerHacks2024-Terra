// MapComponent.jsx
import React, { useState, useCallback } from 'react';
import { GoogleMap, Polygon } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapComponent = ({ 
  isLoaded, 
  coordinates, 
  points, 
  existingPlots, 
  isDrawingMode, 
  onMapClick, 
  onPolygonEdit 
}) => {
  const [map, setMap] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={coordinates}
      zoom={18}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={onMapClick}
      options={{
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      }}
    >
      {points.length > 0 && (
        <Polygon
          path={points}
          options={{
            fillColor: "#FF0000",
            fillOpacity: 0.8,
            strokeColor: "#FF0000",
            strokeOpacity: 1,
            strokeWeight: 1,
            editable: true,
            draggable: false,
          }}
          onMouseUp={onPolygonEdit}
        />
      )}
      {existingPlots.map((plot) => (
        <Polygon
          key={plot.id}
          path={plot.boundary}
          options={{
            fillColor: "#4CAF50",
            fillOpacity: 0.8,
            strokeColor: "#4CAF50",
            strokeOpacity: 1,
            strokeWeight: 1,
            editable: false,
            draggable: false,
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default MapComponent;