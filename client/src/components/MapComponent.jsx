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
  onPolygonEdit,
  onPlotClick 
}) => {
  const [map, setMap] = useState(null);
  const [hoveredPlotId, setHoveredPlotId] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handlePlotClick = (plot, event) => {
    // Prevent triggering map click when clicking on a plot
    if (event) {
      event.stop();
    }
    if (onPlotClick) {
      onPlotClick(plot);
    }
  };

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
          onMouseUp={onPolygonEdit}
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