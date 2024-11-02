import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const MyFarm = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState({ lat: 38.951674, lng: -92.332540 }); // Default coordinates
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'farms', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.location) {
            setCoordinates({
              lat: userData.location.lat,
              lng: userData.location.lng
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserLocation();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
    </div>
  );
};

export default MyFarm;