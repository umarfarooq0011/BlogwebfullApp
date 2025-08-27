import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';

const ProtectedRoute = () => {
  const [auth, setAuth] = useState(null); // null = loading, false = not auth, true = auth
  const [userRole, setUserRole] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await axios.get('/check-auth', { withCredentials: true });
        if (isMounted) {
          setAuth(res.data.success);
          if (res.data.success) {
            setUserRole(res.data.user?.role);
          }
        }
      } catch (error) {
        if (isMounted) {
          setAuth(false);
          
          // Check if user is blocked
          if (error.response?.data?.isBlocked) {
            setIsBlocked(true);
            toast.error(error.response.data.message || 'Your account has been blocked.');
          }
        }
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  if (auth === null && !isBlocked) {
    // You can return a loader here
    return <div className="text-center py-10 text-white">Checking authentication...</div>;
  }

  if (isBlocked) {
    // Redirect to login page with a message about being blocked
    return <Navigate to="/login" state={{ blocked: true, message: "Your account has been blocked. Please contact an administrator." }} replace />;
  }

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for correct path access based on role
  const pathSegment = location.pathname.split('/')[1];
  
  if (pathSegment === 'admin' && userRole !== 'admin') {
    // Redirect to author dashboard if trying to access admin routes as non-admin
    return <Navigate to="/author" replace />;
  }

  if (pathSegment === 'author' && userRole === 'admin') {
    // Redirect to admin dashboard if trying to access author routes as admin
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
