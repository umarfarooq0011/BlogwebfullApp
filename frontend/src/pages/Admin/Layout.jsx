import { Outlet } from 'react-router';
import Navbar from '../../components/Navbar';
import Sidebar from './Sidebar';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="w-full bg-gray-900 border-b border-gray-700 shadow-lg">
        <Navbar />
      </div>
      {/* Hamburger for mobile */}
      {!sidebarOpen && (
        <button
          className="md:hidden fixed top-5 left-4 z-30 bg-gray-900 p-2 rounded-full shadow-lg border border-gray-700"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaBars size={22} />
        </button>
      )}
      {/* Sidebar + Main content layout */}
      <div className="flex">
        {/* Sidebar overlay for mobile */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-40 z-20 transition-opacity duration-300 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full z-30 transform transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
          {/* Cross mark inside sidebar for mobile */}
          {sidebarOpen && (
            <button
              className="md:hidden absolute top-5 right-4 z-40 bg-gray-900 p-2 rounded-full shadow-lg border border-gray-700"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <FaTimes size={22} />
            </button>
          )}
          <Sidebar />
        </div>
        {/* Main content */}
        <div className="flex-1 p-6 md:ml-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
