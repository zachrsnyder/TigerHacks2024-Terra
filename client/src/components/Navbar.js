import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Search, X, Trees  } from 'lucide-react';
import { useMap } from '../contexts/MapContext';
import logoImage from '../assets/farm t.png';
import PieChart from './PieChart'; // Import your PieChart component

const Navbar = () => {
    const { centerMap } = useMap();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isZipModalOpen, setIsZipModalOpen] = useState(false);
    const buttonRef = useRef(null);
    const modalRef = useRef(null);
    const [farmName, setFarmName] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [newZipCode, setNewZipCode] = useState('');
    const [error, setError] = useState('');
    const [isMyFarmModalOpen, setIsMyFarmModalOpen] = useState(false);
    const [totalArea, setTotalArea] = useState(0);
    const [chartData, setChartData] = useState({
      labels: [],
      values: []
    });

    const fetchCropData = async () => {
      if (!currentUser) return;
  
      try {
          const plotsQuery = query(
              collection(db, 'farms', currentUser.uid, 'plots')
          );
          
          const plotsSnapshot = await getDocs(plotsQuery);
          
          const cropTotals = new Map();
          let calculatedTotalArea = 0;
  
          const sqMetersToAcres = 0.000247105;
          
          plotsSnapshot.forEach((doc) => {
              const plotData = doc.data();
              // Convert area from square meters to acres
              const areaInAcres = (plotData.area || 0) * sqMetersToAcres;
              calculatedTotalArea += areaInAcres;
              
              // If crop is missing, undefined, null, or empty string, count as "Unset"
              const cropType = (!plotData.crop || plotData.crop.trim() === '') ? 'Unset' : plotData.crop;
              
              const currentTotal = cropTotals.get(cropType) || 0;
              cropTotals.set(cropType, currentTotal + areaInAcres);
          });
          
          setTotalArea(Math.round(calculatedTotalArea * 100) / 100); // Round to 2 decimal places
          
          // Convert to chart data format
          const labels = Array.from(cropTotals.keys()).filter(crop => cropTotals.get(crop) > 0);
          const values = labels.map(crop => {
              const acres = cropTotals.get(crop);
              return Math.round(acres * 100) / 100;
          });
          
          setChartData({
              labels: labels,
              values: values
          });
          
      } catch (error) {
          console.error('Error fetching crop data:', error);
          setTotalArea(0);
          setChartData({
              labels: [],
              values: []
          });
      }
    };
    

    useEffect(() => {
      if (isModalOpen && buttonRef.current && modalRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        modalRef.current.style.top = `${buttonRect.bottom + 8}px`; // 8px gap
        modalRef.current.style.right = `${window.innerWidth - buttonRect.right}px`;
      }
    }, [isModalOpen]);

    const handleLogout = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await logout();
        setIsModalOpen(false);
        setFarmName(''); // Clear farm name state
        navigate('/login');
      } catch (error) {
        console.error('Failed to log out:', error);
      }
    };

    const handleMyFarm = async (e) => {
      e.preventDefault();
      await fetchCropData(); // Fetch crop data before opening modal
      setIsMyFarmModalOpen(true);
      setIsModalOpen(false);
    };


    useEffect(() => {
      const getFarmData = async () => {
        if (currentUser) {
          try {
            const farmDoc = await getDoc(doc(db, 'farms', currentUser.uid));
            if (farmDoc.exists()) {
              const farmData = farmDoc.data();
              setFarmName(farmData.farmName);
              setZipCode(farmData.zipCode);
            }
          } catch (error) {
            console.error('Error getting farm data:', error);
          }
        }
      };
    
      getFarmData();
    }, [currentUser]);

    const handleZipSubmit = async (e) => {
      e.preventDefault();
      setError('');
    
      if (newZipCode.length !== 5 || !/^\d+$/.test(newZipCode)) {
        setError('Please enter a valid 5-digit zip code');
        return;
      }
    
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${newZipCode}&key=AIzaSyCjb_mLTZBV4jfa3Yf8rpAqmqemQZQBugA`
        );
        const data = await response.json();
    
        if (data.results && data.results[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          const location = { lat, lng };
          
          try {
            await setDoc(doc(db, 'farms', currentUser.uid), {
              location: location,
              zipCode: newZipCode,
              updatedAt: new Date().toISOString()
            }, { merge: true });
    
            setZipCode(newZipCode);
            setIsZipModalOpen(false);
            setIsModalOpen(false);
            
            // Force reload the page to update the map
            window.location.reload();
            
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

    const handleFarmClick = async () => {
      if (zipCode) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.results && data.results[0]) {
            const { lat, lng } = data.results[0].geometry.location;
            centerMap({ lat, lng }, null);
          }
        } catch (error) {
          console.error('Error getting coordinates:', error);
        }
      }
    };

    if (!currentUser) return null;

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-[2]">
        <nav className="bg-primary backdrop-blur-sm shadow-lg">
          <div className="w-full px-0">
            <div className="flex justify-between items-center h-16">
            <div 
                className="flex items-center ml-4 cursor-pointer" 
                onClick={handleFarmClick}
              >
                <img src={logoImage} alt="Logo" className='w-12 h-12 shadow-sm '/>
                <div className="ml-4 flex flex-col items-start">
                  {farmName ? (
                    <>
                      <h1 className="text-text text-xl font-bold -mt-1">{farmName}</h1>
                      <span className="text-text text-xs tracking-wide">Terra</span>
                    </>
                  ) : (
                    <h1 className="text-white text-xl font-bold">Terra</h1>
                  )}
                </div>
              </div>
              {/* User section */}
              <div className="flex items-center mr-4 relative">
                {/* User email */}
                <span className="text-text text-sm mr-2">
                  {currentUser.email}
                </span>
                {/* Modal trigger button */}
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-white focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-500">
                    <span className="text-sm">{currentUser.email[0].toUpperCase()}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
      {/* My Farm Modal */}
      {isMyFarmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-8 pb-4 relative">
                    <button 
                        onClick={() => setIsMyFarmModalOpen(false)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center space-x-3 mb-4">
                        <Trees size={36} />
                        <h2 className="text-2xl font-bold">{farmName}</h2>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <p className="text-gray-600">{zipCode}</p>
                        <p className="text-gray-600 font-medium">
                            Total Area: {totalArea.toLocaleString()} acres
                        </p>
                    </div>
                </div>
                <div className="flex-1 flex">
                    {/* Fixed Left Column - Pie Chart */}
                    <div className="w-1/2 px-8">
                        <div className="h-80 mt-10">
                            <PieChart data={chartData} />
                        </div>
                    </div>
                    <div className="w-1/2 px-8 flex flex-col -mt-"> {/* Added negative margin here */}
                        {chartData.values.length > 0 ? (
                            <div className="bg-gray-50 rounded-lg flex flex-col flex-1">
                                {/* Fixed header */}
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-700">Crop Distribution</h3>
                                </div>
                                
                                {/* Scrollable content */}
                                <div className="p-6 pt-4 overflow-y-auto max-h-[calc(90vh-20rem)]">
                                    <div className="space-y-3">
                                        {chartData.labels.map((label, index) => (
                                            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                                                <div className="flex items-center space-x-3">
                                                    <div 
                                                        className="w-4 h-4 rounded-full"
                                                        style={{
                                                            backgroundColor: label === 'Unset' ? '#9CA3AF' : 
                                                                `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                                                        }}
                                                    />
                                                    <span className="text-base font-medium text-gray-700">{label}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-base font-medium text-gray-900">
                                                        {chartData.values[index].toLocaleString()} acres
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {((chartData.values[index] / totalArea) * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No crop data available
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4" />
            </div>
        </div>
    )}


      {/* Modal/Dropdown */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-[150]"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal positioned like dropdown */}
          <div
            ref={modalRef}
            className="fixed z-[200] w-80 bg-white rounded-lg shadow-lg"
            style={{ maxHeight: 'calc(100vh - 96px)' }} // Ensure it doesn't go off screen
          >
            {/* Modal content */}
            <div className="p-4 space-y-4">
            {/* User info section */}
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white text-lg">
                    {currentUser.email[0].toUpperCase()}
                </span>
                </div>
                <div>
                <p className="text-sm font-medium text-gray-900">
                    {currentUser.email}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} />
                    <p>
                    {zipCode ? zipCode : 'No zip code set'}
                    </p>
                </div>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="space-y-1">
                <button
                type="button"
                onClick={handleMyFarm}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                My Farm
                </button>
                <button
                type="button"
                onClick={() => setIsZipModalOpen(true)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                Change Location
                </button>
                
                <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                Sign out
                </button>
            </div>
            </div>
          </div>
        </>
      )}
      {/* Zip Code Change Modal */}
      {isZipModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[25vh] z-[300]">
          <div className="w-full max-w-md px-4">
            <form onSubmit={handleZipSubmit} className="w-full">
              <div className="relative">
                <div className="flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow w-full h-12 px-4">
                  <Search className="text-gray-400 mr-2" size={20} />
                  <input
                    type="text"
                    value={newZipCode}
                    onChange={(e) => setNewZipCode(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Enter new zip code"
                    maxLength={5}
                  />
                  <button
                    type="button"
                    onClick={() => setIsZipModalOpen(false)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                {error && (
                  <p className="absolute mt-2 text-sm text-red-600 text-center w-full">
                    {error}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;