import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import MapComponent from './MapComponent';
import SearchBar from './SearchBar';
import PlotNameInput from './PlotNameInput';
import ControlButtons from './ControlButtons';
import ErrorMessage from './ErrorMessage';
import LeftDashboard from './LeftBar/LeftDashboard';
import FieldInfo from './FieldInfo';
import { useMap } from '../contexts/MapContext';
import returnLargestCentroid from '../utils/kmeans';
import AddFieldGuide from './AddFieldGuide';
import SidebarGuide from './SidebarGuide';



const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { coordinates, setCoordinates } = useMap();
  const [farmName, setFarmName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [currentStep, setCurrentStep] = useState('loading');
  const [error, setError] = useState('');
  const [points, setPoints] = useState([]);
  const [existingPlots, setExistingPlots] = useState([]);
  const [isNamingPlot, setIsNamingPlot] = useState(false);
  const [newPlotName, setNewPlotName] = useState('');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [editingPlot, setEditingPlot] = useState(null);
  const [isEditingShape, setIsEditingShape] = useState(false);
  const [showFieldNames, setShowFieldNames] = useState(true);
  const [showPlotFill, setShowPlotFill] = useState(true);
  const {centerMap} = useMap()
  const [hasAddedField, setHasAddedField] = useState(false);
  const [showSidebarGuide, setShowSidebarGuide] = useState(false);

  //called when editing starts, intializes plotting
  const handleStartShapeEdit = (plot) => {
    setEditingPlot(plot);
    setIsEditingShape(true);
    setPoints(plot.boundary);
    setIsDrawingMode(true);
  };

  //loads google maps api
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry']
  });

  // Function to update plot data
  const handleUpdatePlot = async (plotId, updatedData) => {
    try {
      // Update in Firestore
      await setDoc(
        doc(db, 'farms', currentUser.uid, 'plots', plotId),
        updatedData,
        { merge: true }
      );
      
      // Update local state
      setExistingPlots(prevPlots =>
        prevPlots.map(plot =>
          plot.id === plotId ? { ...plot, ...updatedData } : plot
        )
      );
      
      // Update selected plot
      setSelectedPlot(prev =>
        prev.id === plotId ? { ...prev, ...updatedData } : prev
      );
    } catch (error) {
      console.error('Error updating plot:', error);
      setError('Error updating plot');
    }
  };
  

  useEffect(() => {
    // Function to fetch and set up initial farm data
    const fetchData = async () => {
      try {
        const farmDocRef = doc(db, 'farms', currentUser.uid);
        const farmDoc = await getDoc(farmDocRef);
        
        if (farmDoc.exists()) {
          const farmData = farmDoc.data();
          setFarmName(farmData.farmName || '');
          setZipCode(farmData.zipCode || '');

          // Check if they have any fields
          const plotsSnap = await getDocs(collection(db, 'farms', currentUser.uid, 'plots'));
          const hasFields = !plotsSnap.empty;
          setHasAddedField(hasFields);
          
          // Determine which setup step to show based on existing data
          if (hasFields) {
            setCurrentStep('complete');
          } else if (farmData.location || farmData.zipCode) {
            setCurrentStep('addField');
          } else if (farmData.farmName) {
            setCurrentStep('zipCode');
          } else {
            setCurrentStep('name');
          }
  
          // Fetch plots
          const plotsRef = collection(db, 'farms', currentUser.uid, 'plots');
          const plotsData = [];
          plotsSnap.forEach(doc => {
            plotsData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          setExistingPlots(plotsData);
          
          // Only do k-means if we have enough plot centers
          if (plotsData.length > 0) {
            const allPlotCenters = plotsData.map(plot => plot.center).filter(center => 
              // Filter out any invalid centers
              Array.isArray(center) && 
              center.length === 2 && 
              !isNaN(center[0]) && 
              !isNaN(center[1])
            );
            
            if (allPlotCenters.length > 0) {
              // Use minimum between number of points and requested k
              const effectiveK = Math.min(4, allPlotCenters.length);
              const centerLoco = returnLargestCentroid(allPlotCenters, effectiveK);

              // Update farm document with new calculated center
              await setDoc(farmDocRef, {
                location: centerLoco
              }, { merge: true });

              // Center map on calculated center
              const lat = centerLoco[0];
              const lng = centerLoco[1];
              centerMap({lat, lng}, null);
            } else if (farmData.location) {
              // Fallback to existing location if no valid plot centers
              centerMap({
                lat: farmData.location.lat || farmData.location[0],
                lng: farmData.location.lng || farmData.location[1]
              }, null);
            }
          } else if (farmData.location) {
            // If no plots, use existing location
            centerMap({
              lat: farmData.location.lat || farmData.location[0],
              lng: farmData.location.lng || farmData.location[1]
            }, null);
          }
        } else {
          // If farm doesn't exist, create new farm document
          setCurrentStep('name');
          await setDoc(farmDocRef, {
            owner: currentUser.uid,
            ownerEmail: currentUser.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCurrentStep('name');
      }
    };
    fetchData();
  }, [currentUser.uid]);

  // Function to handle map click events when in drawing mode
  const handleMapClick = (e) => {
    if (!isDrawingMode){
      console.log(e.latLng.lat())
      console.log(e.latLng.lng())
      return;
    }
    const newPoint = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    setPoints(prevPoints => [...prevPoints, newPoint]);
  };

  // Function to calculate area of a polygon
  const calculateArea = (points) => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].lat * points[j].lng;
      area -= points[j].lat * points[i].lng;
    }
    area = Math.abs(area) * 111319.9 * 111319.9 / 2;
    return Math.round(area);
  };

  // Function to handle polygon edit events and sets them in state
  const handlePolygonEdit = (updatedPoints) => {
    setPoints(updatedPoints);
  };

  // Function to handle plot name submission
  const handlePlotNameSubmit = async (e) => {
    e.preventDefault();
    if (!newPlotName.trim()) {
      setError('Please enter a plot name');
      return;
    }
  
  // Calculate center of plot
  const calcualteCenter = (points) => {
    let lat = 0;
    let lng = 0;
    for (let i = 0; i < points.length; i++) {
      lat += points[i].lat;
      lng += points[i].lng;
    }
    return [lat / points.length, lng / points.length];
  };
  
    try {
      if (editingPlot) {
        // Update existing plot
        const updatedPlot = {
          ...editingPlot,
          boundary: points,
          area: calculateArea(points),
          center: calcualteCenter(points),
          updatedAt: new Date().toISOString()
        };
        
        // Update in Firestore
        await setDoc(
          doc(db, 'farms', currentUser.uid, 'plots', editingPlot.id),
          updatedPlot,
          { merge: true }
        );
        
        // Update local state
        setExistingPlots(prev =>
          prev.map(plot =>
            plot.id === editingPlot.id ? updatedPlot : plot
          )
        );
      } else {
        // Create new plot
        const plotRef = doc(collection(db, 'farms', currentUser.uid, 'plots'));
        const newPlot = {
          boundary: points,
          name: newPlotName.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          farmId: currentUser.uid,
          area: calculateArea(points),
          active: true,
          center: calcualteCenter(points)
        };
  
        // Save to Firestore
        await setDoc(plotRef, newPlot);
        setExistingPlots(prev => [...prev, { id: plotRef.id, ...newPlot }]);

        // If this is the first field, update the setup step
        if (!hasAddedField) {
          setHasAddedField(true);
          setCurrentStep('complete');
          setShowSidebarGuide(true);
          await setDoc(doc(db, 'farms', currentUser.uid), {
            setupStep: 'complete',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }
      
      // Reset state
      setNewPlotName('');
      setPoints([]);
      setIsNamingPlot(false);
      setIsDrawingMode(false);
      setIsEditingShape(false);
      setEditingPlot(null);
      setError('');
    } catch (error) {
      console.error('Error saving plot:', error);
      setError('Error saving plot');
    }
  };

  // Function to handle farm name submission
  const handleFarmNameSubmit = async (e) => {
    e.preventDefault();
    if (!farmName.trim()) {
      setError('Please enter a farm name');
      return;
    }
    
    // Save farm name to Firestore
    try {
      await setDoc(doc(db, 'farms', currentUser.uid), {
        owner: currentUser.uid,
        ownerEmail: currentUser.email,
        farmName: farmName.trim(),
        setupStep: 'zipCode', // Save the next step
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
  
      setError('');
      setCurrentStep('zipCode');
    } catch (error) {
      console.error('Error saving farm name:', error);
      setError('Error saving farm name');
    }
  };

  // Function to handle zip code submission
  const handleZipCodeSubmit = async (e) => {
    e.preventDefault();
    if (zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }
    
    // Geocode zip code to get location
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      // Check if we got a valid location
      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        const location = { lat, lng };
        // Save location to Firestore
        try {
          await setDoc(doc(db, 'farms', currentUser.uid), {
            location: location,
            zipCode: zipCode,
            setupStep: 'addField', // Changed from 'complete' to 'addField'
            updatedAt: new Date().toISOString()
          }, { merge: true });
          // Update local state
          setCoordinates(location);
          setCurrentStep('addField'); // Changed from 'complete' to 'addField'
          setError('');
        } catch (firestoreError) {
          console.error('Firestore save error:', firestoreError);
          setError('Error saving farm location');
        }
      } else {
        setError('Invalid zip code');
      }
    } catch (error) {
      setError('Error finding location');
      console.error('Geocoding error:', error);
    }
  };
  
  // Function to handle plot deletion
  const handleDeletePlot = async (plotId) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'farms', currentUser.uid, 'plots', plotId));
      
      // Update local state
      setExistingPlots(prevPlots => prevPlots.filter(plot => plot.id !== plotId));
      setSelectedPlot(null);
    } catch (error) {
      console.error('Error deleting plot:', error);
      setError('Error deleting plot');
    }
  };

  // Function to clear drawing mode and reset state
  const clearDrawing = () => {
    setPoints([]);
    setIsDrawingMode(false);
    setIsNamingPlot(false);
    setNewPlotName('');
    setIsEditingShape(false);
    setEditingPlot(null);
  };

  return (
    <div className="h-screen w-screen relative">
      <LeftDashboard 
        pointPlots={existingPlots} 
        setPointPlots={setExistingPlots} 
        selectedPlot={selectedPlot} 
        setSelectedPlot={setSelectedPlot}
        setShowSidebarGuide={setShowSidebarGuide} 
      />
      <div className="h-screen w-screen">
        <MapComponent
          isLoaded={isLoaded}
          coordinates={coordinates}
          points={points}
          existingPlots={existingPlots.filter(plot => 
            !editingPlot || plot.id !== editingPlot.id
          )}
          isDrawingMode={isDrawingMode}
          onMapClick={handleMapClick}
          onPolygonEdit={handlePolygonEdit}
          onPlotClick={(plot) => {
            setSelectedPlot(plot);
            centerMap({ lng: plot.center[1], lat: plot.center[0] }, plot.area)
          }}
          onMapClickOutside={() => setSelectedPlot(null)}
          showFieldNames={showFieldNames}  
          showPlotFill={showPlotFill}
        />
      </div>
      
      {currentStep !== 'complete' && currentStep !== 'addField' && (
        <SearchBar
          currentStep={currentStep}
          value={currentStep === 'name' ? farmName : zipCode}
          onChange={(e) => currentStep === 'name' ? setFarmName(e.target.value) : setZipCode(e.target.value)}
          onSubmit={currentStep === 'name' ? handleFarmNameSubmit : handleZipCodeSubmit}
          error={error}
        />
      )}

      {currentStep === 'addField' && !isDrawingMode && (
        <AddFieldGuide />
      )}
      
      {isNamingPlot && (
        <PlotNameInput
          value={newPlotName}
          onChange={(e) => setNewPlotName(e.target.value)}
          onSubmit={handlePlotNameSubmit}
        />
      )}
      
      {(currentStep === 'complete' || currentStep === 'addField') && (
        <ControlButtons
          isDrawingMode={isDrawingMode}
          points={points}
          onLocationChange={() => setCurrentStep('zipCode')}
          onDrawingStart={() => {
            setIsDrawingMode(true);
            setEditingPlot(null);
          }}
          onSavePlot={() => {
            setIsNamingPlot(true);
            if (editingPlot) {
              setNewPlotName(editingPlot.name);
            }
          }}
          onCancelDrawing={clearDrawing}
          isEditing={isEditingShape}
          showFieldNames={showFieldNames}
          onToggleFieldNames={() => setShowFieldNames(!showFieldNames)}
          showPlotFill={showPlotFill}
          onTogglePlotFill={() => setShowPlotFill(!showPlotFill)} 
        />
      )}
      
      <ErrorMessage error={error} />

      {selectedPlot && (
        <FieldInfo
          plot={selectedPlot}
          onClose={() => setSelectedPlot(null)}
          onDelete={handleDeletePlot}
          onUpdate={handleUpdatePlot}
          onStartShapeEdit={handleStartShapeEdit}
        />
      )}

      {showSidebarGuide && !isDrawingMode && (
        <SidebarGuide />
      )}

    </div>
  );
};

export default Dashboard;
