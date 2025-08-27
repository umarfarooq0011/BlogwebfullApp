import React, { useState, useEffect } from 'react';
import { FaTrash, FaEnvelope } from 'react-icons/fa';
import axios from '../../utils/axiosInstance';

const NewsletterManage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/newsletter/admin/subscribers', { withCredentials: true });
      if (response.data.success) {
        setSubscribers(response.data.subscribers);
      } else {
        setError('Failed to fetch subscribers.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this subscriber?')) {
      try {
        const response = await axios.delete(`/newsletter/admin/subscribers/${id}`, { withCredentials: true });
        if (response.data.success) {
          setSubscribers(subscribers.filter((sub) => sub._id !== id));
        } else {
          alert('Failed to delete subscriber.');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'An error occurred while deleting.');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-white text-center">Loading subscribers...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400 text-center">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-400">Newsletter Subscribers</h1>
          <div className="text-lg font-semibold bg-gray-700 px-4 py-2 rounded-lg">
            Total: {subscribers.length}
          </div>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="space-y-4 sm:hidden">
          {subscribers.map((subscriber, index) => (
            <div key={subscriber._id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-white break-all">{subscriber.email}</span>
                <span className="text-xs text-gray-400 ml-2">#{index + 1}</span>
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Subscribed on: {formatDate(subscriber.createdAt)}
              </div>
              <button
                onClick={() => handleDelete(subscriber._id)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-semibold"
              >
                <FaTrash /> Remove
              </button>
            </div>
          ))}
        </div>

        {/* Desktop View - Table Layout */}
        <div className="hidden sm:block overflow-x-auto rounded-lg bg-gray-800">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold hidden sm:table-cell">#</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Subscribed On</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {subscribers.map((subscriber, index) => (
                <tr key={subscriber._id} className="hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{subscriber.email}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(subscriber.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(subscriber._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-semibold"
                    >
                      <FaTrash /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscribers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No subscribers yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManage;
