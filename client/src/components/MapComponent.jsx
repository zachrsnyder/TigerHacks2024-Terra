import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Polygon } from '@react-google-maps/api';
import { useMap } from '../contexts/MapContext';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapComponent = ({ 
  isLoaded, 
  points, 
  existingPlots, 
  isDrawingMode, 
  onMapClick, 
  onPolygonEdit,
  onPlotClick,
  onMapClickOutside  // Add new prop
}) => {
  const { mapInstance, setMapInstance, coordinates } = useMap();
  const [hoveredPlotId, setHoveredPlotId] = useState(null);
  const [polygon, setPolygon] = useState(null);
  
  const onLoad = useCallback((map) => {
    setMapInstance(map);
  }, [setMapInstance]);

  const onUnmount = useCallback(() => {
    setMapInstance(null);
  }, [setMapInstance]);

  const onPolygonLoad = useCallback((poly) => {
    setPolygon(poly);
  }, []);

  const handlePlotClick = useCallback((plot, event) => {
    // Prevent triggering map click when clicking on a plot
    if (event) {
      event.stop();
    }
    if (onPlotClick) {
      onPlotClick(plot);
    }
  }, [onPlotClick]);

  const handleMapClick = useCallback((event) => {
    // Call the regular onMapClick handler first (for drawing mode)
    if (onMapClick) {
      onMapClick(event);
    }
    
    // If we're not in drawing mode, trigger the outside click handler
    if (!isDrawingMode && onMapClickOutside) {
      onMapClickOutside();
    }
  }, [onMapClick, onMapClickOutside, isDrawingMode]);

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

  // Clean up mapInstance on component unmount
  useEffect(() => {
    return () => {
      setMapInstance(null);
    };
  }, [setMapInstance]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={coordinates}
      zoom={18}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false,
        tilt: 0
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
            fillColor: hoveredPlotId === plot.id ? "#66BB6A" : "#4CAF50",
            fillOpacity: hoveredPlotId === plot.id ? 0.9 : 0.8,
            strokeColor: hoveredPlotId === plot.id ? "#66BB6A" : "#4CAF50",
            strokeOpacity: 1,
            strokeWeight: hoveredPlotId === plot.id ? 2 : 1,
            editable: false,
            draggable: false,
            cursor: 'pointer'
          }}
          onClick={(e) => handlePlotClick(plot, e)}
          onMouseOver={() => setHoveredPlotId(plot.id)}
          onMouseOut={() => setHoveredPlotId(null)}
        />
      ))}
    </GoogleMap>
  );
};

export default MapComponent;