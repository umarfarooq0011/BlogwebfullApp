import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { OrbitControls, Stars } from '@react-three/drei'
import ThreeSpace from '../components/ThreeSpace'
import CanvasLoader from '../components/CanvasLoader'
import { Earth } from '../components/Earth'
import { Books } from '../components/Books'
import { NavLink } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Spinning Earth with soft glow
const SpinningEarth = () => {
  const earthRef = useRef()

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.003
    }
  })

  return (
    <group ref={earthRef}>
      {/* Soft cyan glow around Earth */}
      <pointLight position={[-3.2, 1.5, 1]} intensity={0.8} color="#4cc9f0" />
      <Earth position={[-3.2, 1.5, -1]} scale={0.55} />
    </group>
  )
}

const Landingpage = () => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">

      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 65 }}>
          <Suspense fallback={<CanvasLoader />}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={40} depth={10} count={8000} factor={4} saturation={0} fade />
            
            <ThreeSpace />
            <SpinningEarth />
            {/* Realistic Book Model */}
            <Books position={[-2.5, -2.2, -1]} scale={[0.03, 0.03, 0.03]} />

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">

        {/* Top Nav */}
        <div className="w-full pointer-events-auto">
          <Navbar />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-none mt-16">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-3 text-blue-400 drop-shadow-lg pointer-events-auto">InsightSphere</h1>
          <p className="text-lg sm:text-2xl md:text-3xl font-light italic text-gray-200 mb-4 pointer-events-auto">Where Every Thought Finds a Voice.</p>
          <p className="text-base sm:text-lg text-gray-100 mb-8 font-medium pointer-events-auto max-w-2xl mx-auto">Publish your research, share your insights, and inspire a global audience. Join a premium community of thinkers and creators.</p>
          <NavLink to="/blog" className="bg-white text-black px-7 py-3 sm:px-8 sm:py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-gray-100 transition pointer-events-auto text-base sm:text-lg mb-3">
            Explore Articles
          </NavLink>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 pointer-events-auto tracking-wide">No login required &mdash; start reading instantly.</p>
        </div>
      </div>
    </div>
  )
}

export default Landingpage
