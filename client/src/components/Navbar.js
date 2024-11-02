import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

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
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleMyFarm = async (e) => {
    e.preventDefault();
    navigate('/myfarm');
    setIsModalOpen(false);
  };

  if (!currentUser) return null;

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-[100]">
        <nav className="bg-slate-800/90 backdrop-blur-sm shadow-lg">
          <div className="w-full px-0">
            <div className="flex justify-between items-center h-16">
              {/* Logo/Brand section */}
              <div className="ml-10">
                <h1 className="text-white text-xl font-bold">Terra</h1>
              </div>

              {/* User section */}
              <div className="flex items-center mr-4 relative">
                {/* User email */}
                <span className="text-gray-300 text-sm mr-2">
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
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white text-lg">
                    {currentUser.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.email}
                  </p>
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
    </>
  );
};

export default Navbar;