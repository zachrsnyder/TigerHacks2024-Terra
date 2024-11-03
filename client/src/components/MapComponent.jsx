import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Polygon, OverlayView } from '@react-google-maps/api';
import { useMap } from '../contexts/MapContext';

const containerStyle = {
  width: '100%',
  height: '100%'
};

//Component that renders the Google Map with polygons
const MapComponent = ({ 
  isLoaded, 
  points, 
  existingPlots, 
  isDrawingMode, 
  onMapClick, 
  onPolygonEdit,
  onPlotClick,
  onMapClickOutside,
  showFieldNames,
  showPlotFill  
}) => {
  const { mapInstance, setMapInstance, coordinates } = useMap();
  const [hoveredPlotId, setHoveredPlotId] = useState(null);
  const [polygon, setPolygon] = useState(null);

  // Callback function to set the map instance
  const onLoad = useCallback((map) => {
    setMapInstance(map);
  }, [setMapInstance]);

  // Callback function to unset the map instance
  const onUnmount = useCallback(() => {
    setMapInstance(null);
  }, [setMapInstance]);

  // Callback function to set the polygon instance
  const onPolygonLoad = useCallback((poly) => {
    setPolygon(poly);
  }, []);

  // Callback function to handle plot click
  const handlePlotClick = useCallback((plot, event) => {
    if (event) event.stop();
    if (onPlotClick) onPlotClick(plot);
  }, [onPlotClick]);

  // Callback function to handle map click
  const handleMapClick = useCallback((event) => {
    if (onMapClick) {
      onMapClick(event);
    }
    
    if (!isDrawingMode && onMapClickOutside) {
      onMapClickOutside();
    }
  }, [onMapClick, onMapClickOutside, isDrawingMode]);

  // Callback function to handle vertex edit
  const handleVertexEdit = useCallback(() => {
    if (!polygon) return;

    try {
      // Get the updated points of the polygon
      const path = polygon.getPath();
      const updatedPoints = [];

      // Loop through the path and get the updated points
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        updatedPoints.push({ lat: point.lat(), lng: point.lng() });
      }

      onPolygonEdit(updatedPoints);
    } catch (error) {
      console.error('Error updating polygon:', error);
    }
  }, [polygon, onPolygonEdit]);

  // Set the map instance in the context
  useEffect(() => {
    if (!polygon || !window.google) return;

    const path = polygon.getPath();
    window.google.maps.event.clearListeners(path, 'insert_at');
    window.google.maps.event.clearListeners(path, 'remove_at');
    window.google.maps.event.clearListeners(path, 'set_at');

    const insertListener = path.addListener('insert_at', handleVertexEdit);
    const removeListener = path.addListener('remove_at', handleVertexEdit);
    const setListener = path.addListener('set_at', handleVertexEdit);

    return () => {
      insertListener.remove();
      removeListener.remove();
      setListener.remove();
    };
  }, [polygon, handleVertexEdit]);

  useEffect(() => {
    return () => {
      setMapInstance(null);
    };
  }, [setMapInstance]);

  // Return loading message if the Google Maps api is not loaded
  if (!isLoaded) return <div>Loading...</div>;

  const getPixelPositionOffset = (width, height) => ({
    x: -(width / 2),
    y: -(height / 2)
  });

  return (
    // Render the Google Map component
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={coordinates}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false,
        tilt: 0,
        rotateControl: false
      }}
    >
      {/* Render the polygons if they exist */}
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
      {/* Render the existing plots */}
      {existingPlots.map((plot) => (
        <React.Fragment key={plot.id}>
          <Polygon
            path={plot.boundary}
            options={{
              fillColor: hoveredPlotId === plot.id ? plot.color || "#66BB6A" : plot.color || "#4CAF50",
              fillOpacity: showPlotFill ? (hoveredPlotId === plot.id ? 0.9 : 0.8) : 0,
              strokeColor: hoveredPlotId === plot.id ? plot.color || "#66BB6A" : plot.color || "#4CAF50",
              strokeOpacity: 1,
              strokeWeight: hoveredPlotId === plot.id ? 3 : 2,
              editable: false,
              draggable: false,
              cursor: 'pointer'
            }}
            onClick={(e) => handlePlotClick(plot, e)}
            onMouseOver={() => setHoveredPlotId(plot.id)}
            onMouseOut={() => setHoveredPlotId(null)}
          />
          {/* Render the plot name */}
          {plot.center && showFieldNames && (
            <OverlayView
              position={{ lat: plot.center[0], lng: plot.center[1] }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={getPixelPositionOffset}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  padding: '2px 4px',
                  borderRadius: '2px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlotClick(plot);
                }}
              >
                {plot.name}
              </div>
            </OverlayView>
          )}
        </React.Fragment>
      ))}
    </GoogleMap>
  );
};

export default MapComponent;