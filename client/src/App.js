import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MapProvider from './contexts/MapContext';  // Add this import
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import MyFarm from './components/MyFarm';
import getTimeOfDayTheme from './utils/theme';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  useEffect(() => {
    const theme = getTimeOfDayTheme();
    document.documentElement.setAttribute('data-theme', theme);
  }, [])
  
  return (
    <Router>
      <AuthProvider>
        <MapProvider>  {/* Add MapProvider here */}
          <div className="h-screen w-screen relative overflow-hidden">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/myfarm"
                element={
                  <PrivateRoute>
                    <MyFarm />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </MapProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;