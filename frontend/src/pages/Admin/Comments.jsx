import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';

const CommentsComponent = ({ role = 'admin', userId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date as relative time (e.g., "2 days ago", "just now")
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 5) return "just now";
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return diffInDays === 1 ? "yesterday" : `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
  };

  // Fetch comments based on role
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        let response;
        
        if (role === 'admin') {
          // Admin can see all comments
          response = await axios.get('/api/blog/admin/comments');
        } else if (role === 'author') {
          // Author can only see their own comments
          response = await axios.get('/api/blog/author/comments');
        }

        if (response?.data?.success) {
          setComments(response.data.comments || []);
        } else {
          setError('Failed to fetch comments');
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [role, userId]);

  // Handle delete comment
  const handleDelete = async (commentId, blogId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      let response;
      if (role === 'admin') {
        // Admin can delete any comment
        response = await axios.delete(`/api/blog/admin/comments/${commentId}`, {
          withCredentials: true
        });
      } else if (role === 'author') {
        // Author can only delete their own comments
        response = await axios.delete(`/api/blog/author/comments/${commentId}?blogId=${blogId}`, {
          withCredentials: true
        });
      }

      if (response?.data?.success) {
        // Remove the deleted comment from state
        setComments(comments.filter(c => c._id !== commentId));
      } else {
        alert('Failed to delete comment');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-white text-center">
        <p>Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  // Check if user can delete a comment (admin can delete any, author can delete only their own)
  const canDelete = (comment) => {
    if (role === 'admin') return true;
    if (role === 'author' && comment.user?._id === userId) return true;
    return false;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-400">
        {role === 'admin' ? 'All Comments' : 'My Comments'}
      </h1>

      {/* Mobile View */}
      <div className="space-y-4 sm:hidden">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={comment._id} className="bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-400 mb-1">#{index + 1}</p>
              <p className="font-semibold">{comment.user?.name || 'Anonymous'}</p>
              <p className="italic text-sm text-gray-300">"{comment.text}"</p>
              <p className="text-sm text-gray-400">Blog: {comment.blog?.title || 'Unknown Blog'}</p>
              <p className="text-sm text-gray-400 mb-2">{getRelativeTime(comment.createdAt)}</p>
              {canDelete(comment) && (
                <button
                  onClick={() => handleDelete(comment._id, comment.blog?._id)}
                  className="w-full flex items-center justify-center gap-1 text-xs px-3 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold"
                >
                  <FaTrash /> Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No comments found.</p>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-4 py-2 border-b">#</th>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Comment</th>
              <th className="px-4 py-2 border-b">Blog</th>
              <th className="px-4 py-2 border-b">When</th>
              {/* Only show actions column if there are comments that can be deleted */}
              {comments.some(comment => canDelete(comment)) && (
                <th className="px-4 py-2 border-b">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <tr key={comment._id} className="hover:bg-gray-800">
                  <td className="px-4 py-2 border-b">{index + 1}</td>
                  <td className="px-4 py-2 border-b">{comment.user?.name || 'Anonymous'}</td>
                  <td className="px-4 py-2 border-b italic text-sm">"{comment.text}"</td>
                  <td className="px-4 py-2 border-b">{comment.blog?.title || 'Unknown Blog'}</td>
                  <td className="px-4 py-2 border-b">{getRelativeTime(comment.createdAt)}</td>
                  {canDelete(comment) && (
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleDelete(comment._id, comment.blog?._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-semibold"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-400">
                  No comments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// For Admin page - wrapper component
const Comments = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/check-auth');
        if (response.data && response.data.success) {
          setCurrentUser(response.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="p-4 text-white">Admin access required.</div>;
  }

  return <CommentsComponent role="admin" userId={currentUser._id} />;
};

export { CommentsComponent };
export default Comments;
