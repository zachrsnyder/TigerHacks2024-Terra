import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { Search, Fence, X } from 'lucide-react';
import LeftDashboard from './LeftBar/LeftDashboard';
import { GoogleMap, useJsApiLoader, Polygon } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState({ lat: 38.9517, lng: -92.3341 });
  const [farmName, setFarmName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [currentStep, setCurrentStep] = useState('loading');
  const [error, setError] = useState('');
  const [points, setPoints] = useState([]);
  const [map, setMap] = useState(null);
  const [existingPlots, setExistingPlots] = useState([]);
  const [isNamingPlot, setIsNamingPlot] = useState(false);
  const [newPlotName, setNewPlotName] = useState('');
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry']
  });

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

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

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

  const handlePlotNameSubmit = async (e) => {
    e.preventDefault();
    if (!newPlotName.trim()) {
      setError('Please enter a plot name');
      return;
    }

    try {
      const plotRef = doc(collection(db, 'farms', currentUser.uid, 'plots'));
      await setDoc(plotRef, {
        boundary: points,
        name: newPlotName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        farmId: currentUser.uid,
        area: calculateArea(points),
        active: true
      });

      setExistingPlots(prev => [...prev, {
        id: plotRef.id,
        boundary: points,
        name: newPlotName.trim(),
        area: calculateArea(points)
      }]);

      setNewPlotName('');
      setPoints([]);
      setIsNamingPlot(false);
      setIsDrawingMode(false);
      setError('');
    } catch (error) {
      console.error('Error saving plot:', error);
      setError('Error saving plot');
    }
  };

  const clearDrawing = () => {
    setPoints([]);
    setIsDrawingMode(false);
    setIsNamingPlot(false);
    setNewPlotName('');
  };

  const handlePolygonEdit = (e) => {
    const exactPoint = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };

    const updatedPoints = [...points];

    if (e.vertex !== undefined) {
      // Update existing vertex
      updatedPoints[e.vertex] = exactPoint;
    } else if (e.edge !== undefined) {
      // Insert new point at the midpoint position
      updatedPoints.splice(e.edge + 1, 0, exactPoint);
    }

    setPoints(updatedPoints);
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

  const renderSearchBar = () => {
    const isNameStep = currentStep === 'name';
    const handleSubmit = isNameStep ? handleFarmNameSubmit : handleZipCodeSubmit;
    const value = isNameStep ? farmName : zipCode;
    const setValue = isNameStep ? setFarmName : setZipCode;
    const placeholder = isNameStep ? "Enter your farm's name" : "Enter your farm's zip code";
    const maxLength = isNameStep ? 50 : 5;

    return (
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-20">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <div className="flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow w-96 h-12 px-4">
              {isNameStep ? (
                <Fence className="text-gray-400 mr-2" size={20} />
              ) : (
                <Search className="text-gray-400 mr-2" size={20} />
              )}
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                placeholder={placeholder}
                maxLength={maxLength}
              />
            </div>
            {error && (
              <p className="absolute mt-2 text-sm text-red-600 text-center w-full">{error}</p>
            )}
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen relative">
      <LeftDashboard />
      <div className="h-screen w-screen">
        {isLoaded ? (
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
              fullscreenControl: false
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
                onMouseUp={handlePolygonEdit}
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
        ) : (
          <div>Loading...</div>
        )}
      </div>
      {currentStep !== 'complete' && renderSearchBar()}
      {isNamingPlot && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-20">
          <form onSubmit={handlePlotNameSubmit} className="w-full">
            <div className="relative">
              <div className="flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow w-96 h-12 px-4">
                <Fence className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  value={newPlotName}
                  onChange={(e) => setNewPlotName(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  placeholder="Enter plot name"
                  maxLength={50}
                  autoFocus
                />
              </div>
            </div>
          </form>
        </div>
      )}
      {currentStep === 'complete' && (
        <div className="absolute bottom-8 right-8 z-10 space-y-2">
          <button
            onClick={() => setCurrentStep('zipCode')}
            className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
          >
            Change Location
          </button>
          {!isDrawingMode ? (
            <button
              onClick={() => setIsDrawingMode(true)}
              className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
            >
              Draw New Plot
            </button>
          ) : (
            <>
              {points.length >= 3 ? (
                <button
                  onClick={() => setIsNamingPlot(true)}
                  className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
                >
                  Save Plot
                </button>
              ) : (
                <button
                  className="bg-gray-300 px-4 py-2 rounded-full shadow-lg w-full cursor-not-allowed"
                  disabled
                >
                  Mark at least 3 points
                </button>
              )}
              <button
                onClick={clearDrawing}
                className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
              >
                Cancel Drawing
              </button>
            </>
          )}
        </div>
      )}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;