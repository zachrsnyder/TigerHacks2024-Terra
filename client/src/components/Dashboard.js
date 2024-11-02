import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
      // Use Geocoding API to convert zip code to coordinates
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=AIzaSyCjb_mLTZBV4jfa3Yf8rpAqmqemQZQBugA`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoordinates({ lat, lng });
        setIsInitialView(false);
        setError('');

        // Save to Firestore
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
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Terra Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Map */}
      <div className="h-screen w-screen">
        <iframe
          title="Google Maps Satellite"
          className="w-full h-full border-0"
          src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyCjb_mLTZBV4jfa3Yf8rpAqmqemQZQBugA&center=${coordinates.lat},${coordinates.lng}&zoom=18&maptype=satellite`}
          allowFullScreen
        />
      </div>

      {/* Centered Zip Code Input - Only shown initially or when error exists */}
      {(isInitialView || error) && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center z-20">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-center mb-6">
              Welcome to Terra
            </h2>
            <form onSubmit={handleZipCodeSubmit} className="space-y-4">
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your zip code to begin
                </label>
                <input
                  type="text"
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter zip code"
                  maxLength={5}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                View Location
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Map Controls - Only shown after zip code is entered */}
      {!isInitialView && (
        <div className="absolute bottom-8 right-8 z-10">
          <button
            onClick={() => setIsInitialView(true)}
            className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-colors"
          >
            Change Location
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;