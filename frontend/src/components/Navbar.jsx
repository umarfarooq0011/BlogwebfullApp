import { useNavigate } from 'react-router';
import { FaSignOutAlt, FaUserCircle, FaEnvelope, FaTachometerAlt, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showUserInfo, setShowUserInfo] = useState(false);
    
    const userMenuRef = useRef(null);

    // Close user info dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserInfo(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                setIsLoading(true);
                // Check if authenticated
                const authRes = await axios.get('/api/check-auth', { withCredentials: true });
                
                if (authRes.data.success) {
                    setIsAuthenticated(true);
                    setUserName(authRes.data.user.name);
                    setUserEmail(authRes.data.user.email);
                    
                    // Get user role
                    const roleRes = await axios.get('/api/check-role', { withCredentials: true });
                    if (roleRes.data.success) {
                        setUserRole(roleRes.data.role);
                    }
                } else {
                    setIsAuthenticated(false);
                    setUserRole(null);
                    setUserEmail('');
                }
            } catch (err) {
                // If API call fails, assume not authenticated
                console.error("Auth check error:", err);
                setIsAuthenticated(false);
                setUserRole(null);
                setUserEmail('');
            } finally {
                setIsLoading(false);
            }
        };
        
        checkAuthStatus();
    }, []);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const response = await axios.post('/api/logout', {}, { withCredentials: true });
            
            if (response.data.success) {
                toast.success('Logged out successfully');
                setIsAuthenticated(false);
                setUserRole(null);
                setUserEmail('');
                // Redirect to home page after successful logout
                navigate('/');
            } else {
                toast.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('An error occurred during logout');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleDashboardClick = () => {
        // Navigate to the appropriate dashboard based on user role
        if (userRole === 'admin') {
            navigate('/admin');
        } else if (userRole === 'author') {
            navigate('/author');
        }
        // Close user info dropdown
        setShowUserInfo(false);
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action is irreversible and will delete all your data.')) {
            try {
                const response = await axios.delete('/api/delete-account', { withCredentials: true });
                if (response.data.success) {
                    toast.success('Account deleted successfully');
                    setIsAuthenticated(false);
                    setUserRole(null);
                    setUserEmail('');
                    navigate('/');
                } else {
                    toast.error(response.data.message || 'Failed to delete account');
                }
            } catch (error) {
                console.error('Delete account error:', error);
                toast.error('An error occurred while deleting your account.');
            }
        }
    };

    return (
        <div className="flex justify-between items-center mx-2 sm:mx-20 xl:mx-32 py-4 z-10">
            <div
                onClick={() => navigate('/blog')}
                className="text-2xl sm:text-3xl font-bold cursor-pointer bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
            >
                BlogWeb
            </div>
            
            <div className="flex items-center gap-3">
                {isLoading && (
                    <div className="w-11 h-11 rounded-full bg-gray-700 animate-pulse"></div>
                )}

                {!isLoading && isAuthenticated && (
                    <div className="relative" ref={userMenuRef}>
                        <button 
                            onClick={() => setShowUserInfo(!showUserInfo)}
                            className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/70 p-1.5 pr-4 rounded-full transition-all duration-300"
                            aria-label={showUserInfo ? "Hide user info" : "Show user info"}
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-lg border-2 border-gray-600">
                                <FaUserCircle className="text-lg" />
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-semibold text-white -mb-1">{userName}</p>
                                <p className="text-xs text-blue-300 capitalize">{userRole}</p>
                            </div>
                        </button>
                        
                        {/* User info and logout dropdown */}
                        {showUserInfo && (
                            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20 transition-all duration-300 transform animate-slideIn">
                                <div className="p-4 bg-white/5 rounded-t-xl">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white mr-4 text-xl font-bold border-2 border-gray-600">
                                            <FaUserCircle />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg">{userName}</p>
                                            <p className="text-sm text-blue-300 capitalize">{userRole || 'User'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-400 mt-4 text-sm bg-black/20 p-2 rounded-lg">
                                        <FaEnvelope className="mr-3 flex-shrink-0" />
                                        <span className="truncate">{userEmail}</span>
                                    </div>
                                </div>
                                
                                <div className="py-2">
                                    {(userRole === 'admin' || userRole === 'author') && (
                                        <button 
                                            onClick={handleDashboardClick}
                                            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-200 hover:bg-white/10 flex items-center gap-3 transition-colors"
                                        >
                                            <FaTachometerAlt className="text-blue-400 text-base" />
                                            <span>Go to Dashboard</span>
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-200 hover:bg-white/10 flex items-center gap-3 transition-colors"
                                    >
                                        <FaSignOutAlt className="text-red-500 text-base" />
                                        <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                                    </button>
                                </div>

                                {userRole === 'author' && (
                                    <div className="border-t border-gray-700/50">
                                        <div className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">Danger Zone</p>
                                            <button 
                                                onClick={handleDeleteAccount}
                                                className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 bg-red-900/20 hover:bg-red-900/50 rounded-lg flex items-center gap-3 transition-colors"
                                            >
                                                <FaTrashAlt />
                                                <span>Delete My Account</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {!isLoading && !isAuthenticated && (
                    <>
                        <button 
                            onClick={() => navigate('/login')}
                            className='px-5 py-2 sm:px-6 sm:py-2.5 border border-white rounded-lg hover:bg-white hover:text-black transition text-sm sm:text-base font-medium'
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => navigate('/signup')}
                            className='px-5 py-2 sm:px-6 sm:py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition text-sm sm:text-base font-medium'
                        >
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Add a fade-in animation
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-slideIn {
  animation: slideIn 0.2s ease-out forwards;
}
`;
document.head.appendChild(style);

export default Navbar;