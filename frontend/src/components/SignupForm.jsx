import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-toastify';
import ClipLoader from "react-spinners/ClipLoader";

const SignupForm = () => {
  const [loading, setLoading] = useState(false);
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({ name: '', email: '', password: '' });

    try {
      const response = await axios.post('/api/signup', formData);

      if (response.data.success) {
        toast.success("🚀 Welcome! A verification code has been sent to your email.", { autoClose: 5000 });
        localStorage.setItem('verificationEmail', formData.email);
        navigate('/verify-email');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      
      if (errorMessage.toLowerCase().includes("email already exists")) {
        setFieldErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes("password")) {
        setFieldErrors(prev => ({ ...prev, password: errorMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-4 sm:mx-0 rounded-2xl bg-gradient-to-br from-gray-600/20 via-gray-600/10 to-gray-600/30 shadow-2xl border border-gray-200/10 backdrop-blur-lg p-8">
      <h2 className="text-3xl font-extrabold text-blue-400 mb-2 text-center drop-shadow-lg">Create Account</h2>
      <p className="text-gray-300 text-center mb-6 text-sm">Sign up to join InsightSphere</p>
      
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-gray-200 text-sm font-semibold mb-1" htmlFor="name">Name</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"><FaUser /></span>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} autoComplete="name" required className={`w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800/80 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-700'} focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition`} placeholder="Your Name" />
          </div>
          {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
        </div>
        <div>
          <label className="block text-gray-200 text-sm font-semibold mb-1" htmlFor="email">Email</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"><FaEnvelope /></span>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" required className={`w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800/80 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-700'} focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition`} placeholder="you@example.com" />
          </div>
          {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="block text-gray-200 text-sm font-semibold mb-1" htmlFor="password">Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"><FaLock /></span>
            <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} autoComplete="new-password" required className={`w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800/80 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-700'} focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition`} placeholder="••••••••" />
            <button type="button" tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 focus:outline-none" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
        </div>
       
        <button type="submit" disabled={loading} className="w-full py-2.5 mt-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg shadow-md hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed">
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