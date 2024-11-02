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
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 -z-5" />

      {/* Login Form */}
      <div className="bg-[#feebca] backdrop-blur-sm p-10 rounded-lg shadow-2xl w-full max-w-sm mx-4 py-5 px-5">
        <h2 className="text-3xl font-semibold text-center mb-5">Login</h2>
        {error && <div className="mb-6 text-red-500 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="">
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-1">
              Email:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e9060]"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e9060]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#4d4b30] text-white py-3 mt-4 rounded-lg hover:bg-[#33321e] focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold transition-colors"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/register" className="text-[#3e8531] hover:text-[#3e8531] font-medium">
            Need an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
