import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-toastify';
import ClipLoader from "react-spinners/ClipLoader";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blockedMessage = location.state?.blocked ? location.state.message : null;

  useEffect(() => {
    if (blockedMessage) {
      setError(blockedMessage);
      toast.error(blockedMessage);
    }
  }, [blockedMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/login', formData, {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast.success('Login successful!');
        // Navigate based on user role
        const userRole = response.data.user.role;
        
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/author');
        }
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        const errorMessage = err.response.data.message;
        setError(errorMessage || 'Login failed. Please try again.');
        
        // Special handling for blocked users
        if (err.response.status === 403 && err.response.data.message.includes('blocked')) {
          toast.error(errorMessage, {
            autoClose: 5000
          });
        }
        // Special handling for unverified email
        else if (errorMessage === 'Please verify your email') {
          localStorage.setItem('verificationEmail', formData.email);
          toast.error('Please verify your email first.', {
            onClose: () => navigate('/verify-email')
          });
        }
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-4 sm:mx-0 rounded-2xl bg-gradient-to-br from-gray-600/20 via-gray-600/10 to-gray-600/30 shadow-2xl border border-gray-200/10 backdrop-blur-lg p-8">
      <h2 className="text-3xl font-extrabold text-blue-400 mb-2 text-center drop-shadow-lg">Welcome Back</h2>
      <p className="text-gray-300 text-center mb-6 text-sm">Sign in to your account</p>
      
      {error && (
        <div className="mb-4 bg-red-500/20 text-red-300 text-sm py-2 px-3 rounded-lg text-center">
          {error}
        </div>
      )}
      
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-200 text-sm font-semibold mb-1" htmlFor="email">Email</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <FaEnvelope />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-200 text-sm font-semibold mb-1" htmlFor="password">Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <FaLock />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800/80 border border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 focus:outline-none"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash className="cursor-pointer" /> : <FaEye className="cursor-pointer" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <NavLink to="/forget-password" className="text-xs text-blue-400 hover:underline">Forgot password?</NavLink>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer py-2.5 mt-2 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold text-lg shadow-md hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? <ClipLoader size={20} color="#ffffff" /> : "Sign In"}
        </button>
        <div className="text-center text-sm text-gray-300">
          Don't have an account? <NavLink to="/signup" className="text-blue-400 hover:underline">Sign up</NavLink>
        </div>
      </form>
    </div>
  );
};

export default LoginForm; 