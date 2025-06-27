import React, { useState, useEffect } from 'react';
import { FaBan, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/users', {
        withCredentials: true
      });
      
      if (response.data && response.data.success) {
        setUsers(response.data.users || []);
        setError(null);
      } else {
        setError('Failed to load users');
        toast.error('Failed to load users');
      }
    } catch (err) {
      setError(`Error: ${err.response?.data?.message || err.message}`);
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to change this user\'s status?')) {
      return;
    }
    
    setProcessingId(id);
    try {
      const response = await axios.patch(`/api/admin/users/${id}/toggle-block`, {}, {
        withCredentials: true
      });
      
      if (response.data && response.data.success) {
        toast.success(response.data.message);
        // Update user in the state
        setUsers(users.map(user =>
          user._id === id ? { ...user, isBlocked: !user.isBlocked } : user
        ));
      } else {
        toast.error('Failed to update user status');
      }
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 mb-4 sm:mb-6">User Management</h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-20 p-4 rounded">
            <p>{error}</p>
            <button 
              onClick={fetchUsers}
              className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-gray-800">
            {/* For larger screens - Table view */}
            <table className="min-w-full divide-y divide-gray-700 hidden sm:table">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">User ID</th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">User Info</th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">Role</th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">Status</th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-700">
                    <td className="px-3 py-3 text-sm">#{user._id.substring(0, 6)}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </td>
                    <td className="px-3 py-3 text-sm capitalize">{user.role}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        !user.isBlocked 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {!user.isBlocked ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        disabled={processingId === user._id || user.role === 'admin'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded font-semibold ${
                          user.role === 'admin' 
                          ? 'bg-gray-500 cursor-not-allowed'
                          : !user.isBlocked
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {processingId === user._id ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                        ) : !user.isBlocked ? (
                          <><FaBan className="text-sm" /> Block User</>
                        ) : (
                          <><FaCheck className="text-sm" /> Unblock User</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-400">
                      No users available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* For mobile screens - Card view */}
            <div className="sm:hidden divide-y divide-gray-700">
              {users.map((user) => (
                <div key={user._id} className="p-4 hover:bg-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-base">{user.name}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      !user.isBlocked 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {!user.isBlocked ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm">
                      <span className="text-gray-400">ID: </span>#{user._id.substring(0, 6)}
                      <span className="mx-2 text-gray-600">|</span>
                      <span className="text-gray-400">Role: </span>
                      <span className="capitalize">{user.role}</span>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      disabled={processingId === user._id || user.role === 'admin'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded font-semibold ${
                        user.role === 'admin' 
                        ? 'bg-gray-500 cursor-not-allowed'
                        : !user.isBlocked
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {processingId === user._id ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                      ) : !user.isBlocked ? (
                        <><FaBan className="text-sm" /> Block</>
                      ) : (
                        <><FaCheck className="text-sm" /> Unblock</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-400">
                  No users available.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
