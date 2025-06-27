import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-toastify';
import ClipLoader from "react-spinners/ClipLoader";

const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    
    // Clear field-specific error when typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({
      name: '',
      email: '',
      password: ''
    });

    try {
      // Use the correct endpoint from your backend routes
      const response = await axios.post('/api/signup', formData, {
        withCredentials: true
      });
      
      if(response.data.success){
        toast.success("🚀 Welcome to InsightSphere! A verification code is on its way — enter it to unlock your dashboard.", {
          autoClose: 5000
        });
        
        // Store email in localStorage for the verification page
        localStorage.setItem('verificationEmail', formData.email);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: ''
        });
        
        // Redirect to verification page
        navigate('/verify-email');
      } else { 
        setError(response.data.message || "Signup failed. Please try again.");
      }
      
    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle backend validation errors
      if (error.response) {
        const errorMessage = error.response.data.message;
        setError(errorMessage || 'Signup failed. Please try again.');
        
        // Handle specific error cases
        if (errorMessage === "User already exists") {
          setFieldErrors(prev => ({
            ...prev,
            email: "This email is already registered"
          }));
        } else if (errorMessage.includes("Password must be")) {
          setFieldErrors(prev => ({
            ...prev,
            password: errorMessage
          }));
        } else if (error.response.data.errors) {
          // Handle validation errors if returned as an object
          const validationErrors = error.response.data.errors;
          const newFieldErrors = { ...fieldErrors };
          
          Object.keys(validationErrors).forEach(field => {
            if (field in newFieldErrors) {
              newFieldErrors[field] = validationErrors[field];
            }
          });
          
          setFieldErrors(newFieldErrors);
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
      <h2 className="text-3xl font-extrabold text-blue-400 mb-2 text-center drop-shadow-lg">Create Account</h2>
      <p className="text-gray-300 text-center mb-6 text-sm">Sign up to join InsightSphere</p>
      
      {error && (
        <div className="mb-4 bg-red-500/20 text-red-300 text-sm py-2 px-3 rounded-lg text-center">
          {error}
        </div>
      )}
      
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-200 text-sm font-semibold mb-1" htmlFor="name">Name</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <FaUser />
            </span>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
              className={`w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800/80 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-700'} focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition`}
              placeholder="Your Name"
            />
          </div>
          {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
        </div>
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
              className={`w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800/80 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-700'} focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition`}
              placeholder="you@example.com"
            />
          </div>
          {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
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
              autoComplete="new-password"
              required
              className={`w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800/80 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-700'} focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition`}
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
          {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
        </div>
       
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 mt-2 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold text-lg shadow-md hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? <ClipLoader size={20} color="#ffffff" /> : "Sign Up"}
        </button>
        <div className="text-center text-sm text-gray-300">
          Already have an account? <NavLink to="/login" className="text-blue-400 hover:underline">Sign in</NavLink>
        </div>
      </form>
    </div>
  );
};

export default SignupForm; 