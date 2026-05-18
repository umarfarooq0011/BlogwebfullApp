import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useState } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import ThreeSpace from '../components/ThreeSpace';
import CanvasLoader from '../components/CanvasLoader';
import { Earth } from '../components/Earth';
import { Books } from '../components/Books';
import SignupForm from '../components/SignupForm';
import { NavLink} from 'react-router-dom';

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

const Signuppage = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0, isActive: false });


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
      {/* Signup Form Overlay */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <SignupForm />
      </div>
    </div>
  );
};

export default Signuppage; 