import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Search, Fence } from 'lucide-react';
import LeftDashboard from './LeftBar/LeftDashboard';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState({ lat: 38.9517, lng: -92.3341 });
  const [farmName, setFarmName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [currentStep, setCurrentStep] = useState('loading'); // loading, name, zipCode, complete
  const [error, setError] = useState('');

  // Fetch farm data on component mount
  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        const farmDoc = await getDoc(doc(db, 'farms', currentUser.uid));
        if (farmDoc.exists()) {
          const farmData = farmDoc.data();
          if (farmData.farmName && farmData.location) {
            setFarmName(farmData.farmName);
            setCoordinates(farmData.location);
            setZipCode(farmData.zipCode || '');
            setCurrentStep('complete');
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
        console.error('Error fetching farm data:', error);
        setCurrentStep('name');
      }
    };

    fetchFarmData();
  }, [currentUser.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
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
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=AIzaSyCjb_mLTZBV4jfa3Yf8rpAqmqemQZQBugA`
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
              <p className="absolute mt-2 text-sm text-red-600 text-center w-full">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen relative">
      <LeftDashboard/>

      {/* Fullscreen Map */}
      <div className="h-screen w-screen">
        <iframe
          title="Google Maps Satellite"
          className="w-full h-full border-0"
          src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyCjb_mLTZBV4jfa3Yf8rpAqmqemQZQBugA&center=${coordinates.lat},${coordinates.lng}&zoom=18&maptype=satellite`}
          allowFullScreen
        />
      </div>

      {/* Search Bars */}
      {currentStep !== 'complete' && renderSearchBar()}

      {/* Map Controls */}
      {currentStep === 'complete' && (
        <div className="absolute bottom-8 right-8 z-10">
          <button
            onClick={() => setCurrentStep('zipCode')}
            className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Change Location
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;