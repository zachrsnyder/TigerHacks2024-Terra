import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Only render the navbar if there's a logged-in user
  if (!currentUser) return null;

  return (
    <nav className="bg-slate-800 shadow-lg">
      <div className="w-full px-0">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand section */}
          <div className="ml-10">
            <h1 className="text-white text-xl font-bold">Terra</h1>
          </div>

          {/* User section with dropdown */}
          <div className="flex items-center mr-4 relative">
            {/* User email */}
            <span className="text-gray-300 text-sm mr-2">
              {currentUser.email}
            </span>

            {/* Dropdown button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-white focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-500">
                <span className="text-sm">{currentUser.email[0].toUpperCase()}</span>
              </div>
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-12 w-48 py-2 bg-white rounded-md shadow-xl z-50">
                <a
                  href="/placeholder"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  placeholder
                </a>
                <a
                  href="/placeholder1"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  placeholder1
                </a>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;