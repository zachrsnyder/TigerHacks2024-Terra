import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Email validation regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    setError('');

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return false;
    }

    return true;
  };

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
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <div className="w-full max-w-md p-8 space-y-6 bg-primary rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-text">Register</h2>
        
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-text">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 mt-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 mt-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 mt-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-center text-text">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;