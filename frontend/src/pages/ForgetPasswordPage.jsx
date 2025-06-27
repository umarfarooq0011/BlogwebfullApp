import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import ThreeSpace from '../components/ThreeSpace';
import CanvasLoader from '../components/CanvasLoader';
import { Earth } from '../components/Earth';
import { Books } from '../components/Books';
import Logo from '/assets/logo.png';
import { NavLink } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
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

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mouse, setMouse] = useState({ x: 0, y: 0, isActive: false });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMouse({ x, y, isActive: true });
  };
  
  const handleMouseLeave = () => setMouse((m) => ({ ...m, isActive: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/forget-password', { email }, { withCredentials: true });
      if (response.data.success) {
        setSuccess('Password reset link has been sent to your email.');
        toast.success('Password reset link has been sent to your email.', {
          autoClose: 3000
        });
        setEmail('');
      } else {
        setError(response.data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Forget password error:', err);
      console.log('Error response:', err.response);
      
      if (err.response?.status === 429) {
        setError('Too many requests. Please try again later after 30 minutes.');
        toast.error('Too many requests. Please try again later after 30 minutes.', {
          autoClose: 3000
        });
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        toast.error(err.response?.data?.message || 'Something went wrong. Please try again.', {
          autoClose: 3000
        });
      }
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
          <p className="text-gray-300 text-center mb-6 text-sm">Enter your email to receive a reset link</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
             
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white placeholder-gray-400 outline-none transition"
                  placeholder="Enter your email address"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="bg-red-500/20 text-red-300 text-sm py-2 px-3 rounded-lg mt-2">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-500/20 text-green-300 text-sm py-2 px-3 rounded-lg mt-2">
                  {success}
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold text-lg shadow-md hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : (
                <>
                  <FaLock className="mr-2" />
                  Send Reset Link
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

export default ForgetPasswordPage; 