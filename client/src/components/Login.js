import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import backgroundVideo from '../assets/videos/fieldlogin.mp4';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      
      {/* Overlay to make the login form more visible */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/30 -z-5" />
      
      {/* Login Form */}
      <div className="backdrop-blur-md bg-white/30 p-10 rounded-lg shadow-2xl w-full max-w-sm mx-4 py-5 px-5 border border-white/20">
        <h2 className="text-3xl font-semibold text-center mb-5 text-white">Login</h2>
        {error && <div className="mb-6 text-red-500 text-center bg-white/80 rounded-md py-2">{error}</div>}
        
        <form onSubmit={handleSubmit} className="">
          <div className="mb-4">
            <label htmlFor="username" className="block text-white text-sm font-medium mb-1">
              Email:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-white text-sm font-medium">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-white/20 backdrop-blur-sm text-white py-3 mt-2 rounded-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg font-semibold transition-colors border border-white/30"
          >
            Login
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/register" className="text-white hover:text-gray-200 font-medium">
            Need an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;