import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Search } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState({ lat: 38.9517, lng: -92.3341 });
  const [zipCode, setZipCode] = useState('');
  const [isInitialView, setIsInitialView] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
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
        setCoordinates({ lat, lng });
        setIsInitialView(false);
        setError('');

        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            farmLocation: { lat, lng },
            zipCode: zipCode
          }, { merge: true });
        } catch (firestoreError) {
          console.log('Firestore save error:', firestoreError);
        }
      } else {
        setError('Invalid zip code');
      }
    } catch (error) {
      setError('Error finding location');
      console.error('Geocoding error:', error);
    }
  };

  return (
    <div className="h-screen w-screen relative">
      

      {/* Fullscreen Map */}
      <div className="h-screen w-screen">
        <iframe
          title="Google Maps Satellite"
          className="w-full h-full border-0"
          src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyCjb_mLTZBV4jfa3Yf8rpAqmqemQZQBugA&center=${coordinates.lat},${coordinates.lng}&zoom=18&maptype=satellite`}
          allowFullScreen
        />
      </div>

      {/* Google-style Search Bar */}
      {(isInitialView || error) && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-20">
          <form onSubmit={handleZipCodeSubmit} className="w-full">
            <div className="relative">
              <div className="flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow w-96 h-12 px-4">
                <Search className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  placeholder="Enter your zip code to begin"
                  maxLength={5}
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
      )}

      {/* Map Controls */}
      {!isInitialView && (
        <div className="absolute bottom-8 right-8 z-10">
          <button
            onClick={() => setIsInitialView(true)}
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