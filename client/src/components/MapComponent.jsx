import React, { useState, useCallback, useEffect } from 'react';
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
  const [polygon, setPolygon] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onPolygonLoad = useCallback((poly) => {
    setPolygon(poly);
  }, []);

  const handleVertexEdit = useCallback(() => {
    if (!polygon) return;
    
    try {
      const path = polygon.getPath();
      const updatedPoints = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        updatedPoints.push({
          lat: point.lat(),
          lng: point.lng()
        });
      }
      
      onPolygonEdit(updatedPoints);
    } catch (error) {
      console.error('Error updating polygon:', error);
    }
  }, [polygon, onPolygonEdit]);

  useEffect(() => {
    if (!polygon || !window.google) return;

    const path = polygon.getPath();
    
    // Remove existing listeners to prevent duplicates
    window.google.maps.event.clearListeners(path, 'insert_at');
    window.google.maps.event.clearListeners(path, 'remove_at');
    window.google.maps.event.clearListeners(path, 'set_at');

    // Add new listeners
    const insertListener = path.addListener('insert_at', handleVertexEdit);
    const removeListener = path.addListener('remove_at', handleVertexEdit);
    const setListener = path.addListener('set_at', handleVertexEdit);

    return () => {
      if (path) {
        insertListener.remove();
        removeListener.remove();
        setListener.remove();
      }
    };
  }, [polygon, handleVertexEdit]);

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
        streetViewControl: false,
        zoomControl: false
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
          onLoad={onPolygonLoad}
          onMouseUp={handleVertexEdit}
          onDragEnd={handleVertexEdit}
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