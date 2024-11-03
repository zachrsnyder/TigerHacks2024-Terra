import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import backgroundVideo from '../assets/videos/fieldlogin.gif';
import farmLogo from '../assets/farm t.png';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate form fields
  const validateForm = () => {
    setError('');

    // Check if any field is empty
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Check if password is at least 6 characters
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signup(email, password);
      navigate('/');
    } catch (error) {
      handleError(error);
    }
  };

  // Handle error messages
  const handleError = (error) => {
    switch (error.code) {
      case 'auth/invalid-email':
        setError('Invalid email format');
        break;
      case 'auth/email-already-in-use':
        setError('Email is already in use');
        break;
      case 'auth/weak-password':
        setError('Password should be at least 6 characters');
        break;
      case 'auth/operation-not-allowed':
        setError('Email/password accounts are not enabled');
        break;
      default:
        setError(error.message || 'Failed to create account');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <img
        src={backgroundVideo}
        alt="Field background"
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      />
      
      <div className="absolute top-0 left-0 w-full h-full bg-black/30 -z-5" />
      
      <div className="backdrop-blur-md bg-white/30 p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-white/20">
      <img src={farmLogo} alt="Farm Logo" className="w-20 h-20 mx-auto mb-5 mt-2" />
        <h2 className="text-3xl font-semibold text-center mb-6 text-white">Register</h2>
        
        {error && (
          <div className="mb-6 text-red-500 text-center bg-white/80 rounded-md py-2 px-3" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-white text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg font-semibold transition-colors border border-white/30"
          >
            Register
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-white hover:text-gray-200 font-medium">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;