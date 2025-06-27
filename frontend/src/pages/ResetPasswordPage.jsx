import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import ThreeSpace from '../components/ThreeSpace';
import CanvasLoader from '../components/CanvasLoader';
import { Earth } from '../components/Earth';
import { Books } from '../components/Books';
import Logo from '/assets/logo.png';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import ClipLoader from 'react-spinners/ClipLoader';
import axios from 'axios';
import { toast } from 'react-toastify';

const SpinningEarth = ({ mouse }) => {
  const earthRef = useRef();
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.003 + (mouse.isActive ? mouse.x * 0.04 : 0);
      earthRef.current.rotation.x = 0.1 + (mouse.isActive ? mouse.y * 0.04 : 0);
      earthRef.current.position.x = -3.2 + (mouse.isActive ? mouse.x * 0.5 : 0);
      earthRef.current.position.y = 1.5 + (mouse.isActive ? mouse.y * 0.3 : 0);
      earthRef.current.scale.set(
        0.55 + (mouse.isActive ? Math.abs(mouse.x) * 0.1 : 0),
        0.55 + (mouse.isActive ? Math.abs(mouse.y) * 0.1 : 0),
        0.55 + (mouse.isActive ? Math.abs(mouse.x + mouse.y) * 0.05 : 0)
      );
    }
  });
  return (
    <group ref={earthRef}>
      <pointLight position={[0, 0, 1]} intensity={0.8} color="#4cc9f0" />
      <Earth position={[0, 0, -1]} />
    </group>
  );
};

const AnimatedBooks = ({ mouse }) => {
  const booksRef = useRef();
  useFrame(() => {
    if (booksRef.current) {
      booksRef.current.rotation.y = -0.2 + (mouse.isActive ? mouse.x * 0.3 : 0);
      booksRef.current.rotation.x = 0.1 + (mouse.isActive ? mouse.y * 0.2 : 0);
      booksRef.current.position.x = -3.5 + (mouse.isActive ? mouse.x * 1.2 : 0);
      booksRef.current.position.y = -2.7 + (mouse.isActive ? mouse.y * 0.7 : 0);
      booksRef.current.scale.set(
        0.03 + (mouse.isActive ? Math.abs(mouse.x) * 0.01 : 0),
        0.03 + (mouse.isActive ? Math.abs(mouse.y) * 0.01 : 0),
        0.03 + (mouse.isActive ? Math.abs(mouse.x + mouse.y) * 0.005 : 0)
      );
    }
  });
  return <Books ref={booksRef} position={[-3.5, -2.7, -1]} scale={[0.03, 0.03, 0.03]} />;
};

const AnimatedThreeSpace = ({ mouse }) => {
  const spaceRef = useRef();
  useFrame(() => {
    if (spaceRef.current) {
      spaceRef.current.rotation.y = (mouse.isActive ? mouse.x * 0.2 : 0);
      spaceRef.current.rotation.x = (mouse.isActive ? mouse.y * 0.2 : 0);
      spaceRef.current.position.x = (mouse.isActive ? mouse.x * 0.7 : 0);
      spaceRef.current.position.y = (mouse.isActive ? mouse.y * 0.7 : 0);
      spaceRef.current.scale.set(
        1 + (mouse.isActive ? Math.abs(mouse.x) * 0.1 : 0),
        1 + (mouse.isActive ? Math.abs(mouse.y) * 0.1 : 0),
        1 + (mouse.isActive ? Math.abs(mouse.x + mouse.y) * 0.05 : 0)
      );
    }
  });
  return <group ref={spaceRef}><ThreeSpace /></group>;
};

const ResetPasswordPage = () => {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useParams();
  const [mouse, setMouse] = useState({ x: 0, y: 0, isActive: false });
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMouse({ x, y, isActive: true });
  };
  
  const handleMouseLeave = () => setMouse((m) => ({ ...m, isActive: false }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.password || !form.confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`/api/reset-password/${token}`, { password: form.password }, { withCredentials: true });
      if (res.data.success) {
        setSuccess('Your password has been reset successfully!');
        toast.success('Your password has been reset successfully! You can now login with your new password.', {
          autoClose: 3000,
          onClose: () => {
            navigate('/login');
          }
        });
        setForm({ password: '', confirmPassword: '' });
      } else {
        setError(res.data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.');
      toast.error(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.', {
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 65 }}>
          <Suspense fallback={<CanvasLoader />}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={40} depth={10} count={8000} factor={4} saturation={0} fade />
            <AnimatedThreeSpace mouse={mouse} />
            <SpinningEarth mouse={mouse} />
            <AnimatedBooks mouse={mouse} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Logo at the top */}
      <div className="flex justify-between">
        <NavLink
          to="/"
          className="focus:outline-none"
        >
          <img src={Logo} alt="logo" className="w-32 h-32 cursor-pointer" />
        </NavLink>
      </div>
      
      {/* Form Overlay */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full max-w-md mx-4 sm:mx-0 rounded-2xl bg-gradient-to-br from-gray-600/20 via-gray-600/10 to-gray-600/30 shadow-2xl border border-gray-200/10 backdrop-blur-lg p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-400/20 rounded-full p-4">
              <FaLock size={32} className="text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-400 mb-2 text-center drop-shadow-lg">Reset Password</h2>
          <p className="text-gray-300 text-center mb-6 text-sm">Create a new secure password</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-200 text-sm font-semibold mb-1" htmlFor="password">New Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800/80 border border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition"
                  placeholder="Enter new password"
                  autoComplete="off"
                  disabled={!!success}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={!!success}
                >
                  {showPassword ? <FaEyeSlash className='cursor-pointer' /> : <FaEye className='cursor-pointer' />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-200 text-sm font-semibold mb-1" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                  <FaLock />
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800/80 border border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition"
                  placeholder="Confirm new password"
                  autoComplete="off"
                  disabled={!!success}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 focus:outline-none"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  disabled={!!success}
                >
                  {showConfirm ? <FaEyeSlash className='cursor-pointer' /> : <FaEye className='cursor-pointer' />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-500/20 text-red-300 text-sm py-2 px-3 rounded-lg text-center">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 text-green-300 text-sm py-2 px-3 rounded-lg text-center">
                {success}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-2.5 cursor-pointer mt-2 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold text-lg shadow-md hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : (
                <>
                  <FaLock className="mr-2" />
                  Reset Password
                </>
              )}
            </button>
          </form>
          
          <div className="text-center text-sm text-gray-300 mt-6">
            Remember your password? <NavLink to="/login" className="text-blue-400 hover:underline">Sign in</NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
