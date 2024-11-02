import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import MapComponent from './MapComponent';
import SearchBar from './SearchBar';
import PlotNameInput from './PlotNameInput';
import ControlButtons from './ControlButtons';
import ErrorMessage from './ErrorMessage';
import LeftDashboard from './LeftBar/LeftDashboard';
import FieldInfo from './FieldInfo';
import { useMap } from '../contexts/MapContext';

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

  const handleStartShapeEdit = (plot) => {
    setEditingPlot(plot);
    setIsEditingShape(true);
    setPoints(plot.boundary);
    setIsDrawingMode(true);
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry']
  });

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
    const fetchData = async () => {
      try {
        const farmDoc = await getDoc(doc(db, 'farms', currentUser.uid));
        if (farmDoc.exists()) {
          const farmData = farmDoc.data();
          if (farmData.farmName && farmData.location) {
            setFarmName(farmData.farmName); 
            setCoordinates(farmData.location);
            setZipCode(farmData.zipCode || '');
            setCurrentStep('complete');
            
            const plotsRef = collection(db, 'farms', currentUser.uid, 'plots');
            const plotsSnap = await getDocs(plotsRef);
            const plotsData = [];
            plotsSnap.forEach(doc => {
              plotsData.push({
                id: doc.id,
                ...doc.data()
              });
            });
            setExistingPlots(plotsData);
          } else if (farmData.farmName) {
            setFarmName(farmData.farmName);
            setCurrentStep('zipCode');
          } else {
            setCurrentStep('name');
          }
        } else {
          setCurrentStep('name');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCurrentStep('name');
      }
    };
    fetchData();
  }, [currentUser.uid]);

  const handleMapClick = (e) => {
    if (!isDrawingMode) return;
    const newPoint = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setPoints(prevPoints => [...prevPoints, newPoint]);
  };

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

  const handlePolygonEdit = (updatedPoints) => {
    setPoints(updatedPoints);
  };

  const handlePlotNameSubmit = async (e) => {
    e.preventDefault();
    if (!newPlotName.trim()) {
      setError('Please enter a plot name');
      return;
    }
  
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
  
        await setDoc(
          doc(db, 'farms', currentUser.uid, 'plots', editingPlot.id),
          updatedPlot,
          { merge: true }
        );
  
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
  
        await setDoc(plotRef, newPlot);
        setExistingPlots(prev => [...prev, { id: plotRef.id, ...newPlot }]);
      }
  
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

  const handleFarmNameSubmit = async (e) => {
    e.preventDefault();
    if (!farmName.trim()) {
      setError('Please enter a farm name');
      return;
    }

    try {
      await setDoc(doc(db, 'farms', currentUser.uid), {
        owner: currentUser.uid,
        ownerEmail: currentUser.email,
        farmName: farmName.trim(),
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

  const handleZipCodeSubmit = async (e) => {
    e.preventDefault();
    if (zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        const location = { lat, lng };
        
        try {
          await setDoc(doc(db, 'farms', currentUser.uid), {
            location: location,
            zipCode: zipCode,
            updatedAt: new Date().toISOString()
          }, { merge: true });

          setCoordinates(location);
          setCurrentStep('complete');
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
      <LeftDashboard pointPlots={existingPlots} setPointPlots={setExistingPlots} selectedPlot={selectedPlot} setSelectedPlot={setSelectedPlot}/>
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
          onPlotClick={(plot) => setSelectedPlot(plot)}
        />
      </div>
      
      {currentStep !== 'complete' && (
        <SearchBar
          currentStep={currentStep}
          value={currentStep === 'name' ? farmName : zipCode}
          onChange={(e) => currentStep === 'name' ? setFarmName(e.target.value) : setZipCode(e.target.value)}
          onSubmit={currentStep === 'name' ? handleFarmNameSubmit : handleZipCodeSubmit}
          error={error}
        />
      )}
      
      {isNamingPlot && (
        <PlotNameInput
          value={newPlotName}
          onChange={(e) => setNewPlotName(e.target.value)}
          onSubmit={handlePlotNameSubmit}
        />
      )}
      
      {currentStep === 'complete' && (
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

    </div>
  );
};

export default Dashboard;
