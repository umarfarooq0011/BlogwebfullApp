/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import ThreeSpace from '../components/ThreeSpace';
import CanvasLoader from '../components/CanvasLoader';
import { Earth } from '../components/Earth';
import { Books } from '../components/Books';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';

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

const EmailVerificationPage = () => {
  const OTP_LENGTH = 6;
  const [code, setCode] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendError, setResendError] = useState('');
  const inputsRef = useRef([]);
  const [mouse, setMouse] = useState({ x: 0, y: 0, isActive: false });
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get email from localStorage that was set during signup
    const storedEmail = localStorage.getItem('verificationEmail');
    const urlEmail = new URLSearchParams(location.search).get('email');
    
    // Use email from URL params or localStorage
    const emailToUse = urlEmail || storedEmail || '';
    setUserEmail(emailToUse);
    
    // If no email is available, show a message
    if (!emailToUse) {
      setError('Email not found. Please return to the signup page.');
      toast.error('Could not find your email. Please sign up again.');
    } else {
        inputsRef.current[0]?.focus();
    }
  }, [location.search]);

  // Handle input change and auto-advance
  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;
    let newCode = [...code];
    newCode[idx] = val[val.length - 1]; // Only last digit
    setCode(newCode);
    if (idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
    setError(''); // Clear error on change
  };

  // Handle backspace to move focus and clear
  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (code[idx]) {
        let newCode = [...code];
        newCode[idx] = '';
        setCode(newCode);
        e.preventDefault();
      } else if (idx > 0) {
        let newCode = [...code];
        newCode[idx - 1] = '';
        setCode(newCode);
        inputsRef.current[idx - 1]?.focus();
        e.preventDefault();
      }
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('Text').replace(/[^0-9]/g, '');
    if (pasted.length === OTP_LENGTH) {
      setCode(pasted.split(''));
      inputsRef.current[OTP_LENGTH - 1]?.focus();
      e.preventDefault();
      setError('');
    }
  };

  // Submit logic
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length !== OTP_LENGTH ||!userEmail ) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    if (!userEmail) {
      setError('Email address is missing. Please go back to signup.');
      return;
    }
    setLoading(true);
    setError('');
     try {
      const res = await axios.post('/verify-email', { code: verificationCode, email: userEmail });
      if (res.data.success) {
        toast.success('✅ Email verified! Redirecting to login...', {
          autoClose: 2000,
          onClose: () => {
            localStorage.removeItem('verificationEmail');
            navigate('/login');
          },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(msg);
      toast.error(msg);
      setCode(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all fields are filled
  useEffect(() => {
    if (code.every(c => c) && code.join('').length === OTP_LENGTH) {
      handleSubmit();
    }
  }, [code]);

   const handleResend = async () => {
    if (!userEmail) {
      setResendError('Email address not found.');
      return;
    }
    setResendLoading(true);
    setResendError('');
    setResendMsg('');
    try {
      await axios.post('/api/resend-verification-email', { email: userEmail });
      setResendMsg('A new verification code has been sent.');
      setCode(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } catch (err) {
      setResendError(err.response?.data?.message || 'Failed to resend email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMouse({ x, y, isActive: true });
  };
  
  const handleMouseLeave = () => setMouse((m) => ({ ...m, isActive: false }));

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
      <div className="flex justify-between p-4">
        <NavLink
          to="/"
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
        >
          BlogWeb
        </NavLink>
      </div>
      
      {/* Verification Form Overlay */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full max-w-md mx-4 sm:mx-0 rounded-2xl bg-gradient-to-br from-gray-600/20 via-gray-600/10 to-gray-600/30 shadow-2xl border border-gray-200/10 backdrop-blur-lg p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-400/20 rounded-full p-4">
              <FaEnvelope size={32} className="text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-400 mb-2 text-center drop-shadow-lg">Verify Your Email</h2>
          <p className="text-gray-300 text-center mb-2 text-sm">We have sent a verification code to your email address</p>
          
          {userEmail && (
            <p className="text-blue-400 text-center mb-6 font-medium">{userEmail}</p>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center space-x-2">
              {code.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  ref={el => inputsRef.current[idx] = el}
                  onChange={e => handleChange(e, idx)}
                  onKeyDown={e => handleKeyDown(e, idx)}
                  onPaste={handlePaste}
                  autoFocus={idx === 0}
                  required
                  aria-label={`OTP digit ${idx + 1}`}
                  className="w-10 h-12 text-center text-xl font-bold bg-gray-800/80 border border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white rounded-lg outline-none transition"
                />
              ))}
            </div>
            
            {error && (
              <div className="bg-red-500/20 text-red-300 text-sm py-2 px-3 rounded-lg text-center">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer py-2.5 mt-2 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold text-lg shadow-md hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : 'Verify'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm mb-2">Didn't receive the code?</p>
            
            {resendMsg && (
              <div className="bg-green-500/20 text-green-300 text-sm py-2 px-3 rounded-lg mb-3">
                {resendMsg}
              </div>
            )}
            
            {resendError && (
              <div className="bg-red-500/20 text-red-300 text-sm py-2 px-3 rounded-lg mb-3">
                {resendError}
              </div>
            )}
            
            <button
              onClick={handleResend}
              disabled={resendLoading || !userEmail}
              className="text-blue-400 cursor-pointer hover:underline text-sm font-medium flex items-center justify-center mx-auto disabled:opacity-50 disabled:no-underline"
            >
              {resendLoading ? <ClipLoader size={12} color="#60a5fa" className="mr-2" /> : null}
              Resend Verification Code
            </button>
            
            <div className="mt-4">
              <NavLink to="/login" className="text-gray-400 cursor-pointer hover:text-gray-300 text-xs">
                Back to Login
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
