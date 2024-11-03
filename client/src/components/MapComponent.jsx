import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Polygon, OverlayView } from '@react-google-maps/api';
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
  onMapClickOutside,
  showFieldNames
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
    if (event) event.stop();
    if (onPlotClick) onPlotClick(plot);
  }, [onPlotClick]);

  const handleMapClick = useCallback((event) => {
    if (onMapClick) {
      onMapClick(event);
    }
    
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
        updatedPoints.push({ lat: point.lat(), lng: point.lng() });
      }

      onPolygonEdit(updatedPoints);
    } catch (error) {
      console.error('Error updating polygon:', error);
    }
  }, [polygon, onPolygonEdit]);

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

  if (!isLoaded) return <div>Loading...</div>;

  const getPixelPositionOffset = (width, height) => ({
    x: -(width / 2),
    y: -(height / 2)
  });

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
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
        tilt: 0,
        rotateControl: false
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
        <React.Fragment key={plot.id}>
          <Polygon
            path={plot.boundary}
            options={{
              fillColor: hoveredPlotId === plot.id ? plot.color || "#66BB6A" : plot.color || "#4CAF50",
              fillOpacity: hoveredPlotId === plot.id ? 0.9 : 0.8,
              strokeColor: hoveredPlotId === plot.id ? plot.color || "#66BB6A" : plot.color || "#4CAF50",
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