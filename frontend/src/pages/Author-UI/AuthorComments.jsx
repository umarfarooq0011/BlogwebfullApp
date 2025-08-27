import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { FaTrash } from 'react-icons/fa';

const AuthorComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setCurrentUser] = useState(null);

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

  // Fetch user data and comments
  useEffect(() => {
    const fetchUserAndComments = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await axios.get('/check-auth');
        if (!userResponse.data?.success || userResponse.data?.user?.role !== 'author') {
          setError('Author access required');
          setLoading(false);
          return;
        }
        
        setCurrentUser(userResponse.data.user);
        
        // Get comments on author's blogs
        const commentsResponse = await axios.get('/blog/author/comments');
        if (commentsResponse.data?.success) {
          setComments(commentsResponse.data.comments || []);
        } else {
          setError('Failed to fetch comments');
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndComments();
  }, []);

  // Handle delete comment
  const handleDelete = async (commentId, blogId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/blog/author/comments/${commentId}?blogId=${blogId}`, {
        withCredentials: true
      });

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

  // Check if user can delete a comment (author can delete all comments on their blogs except admin comments)
  const canDelete = (comment) => {
    return comment.user?.role !== 'admin';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-violet-400">
        Comments on Your Blogs
      </h1>

      {/* Mobile View */}
      <div className="space-y-4 sm:hidden">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={comment._id} className="bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-400 mb-1">#{index + 1}</p>
              <p className="font-semibold flex items-center gap-2">
                {comment.user?.name || 'Anonymous'}
                {comment.user?.role === 'admin' && (
                  <span className="bg-red-500 text-xs px-2 py-0.5 rounded text-white">Admin</span>
                )}
                {comment.user?.role === 'author' && (
                  <span className="bg-violet-500 text-xs px-2 py-0.5 rounded text-white">Author</span>
                )}
              </p>
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
          <p className="text-center text-gray-400">No comments found on your blogs.</p>
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
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <tr key={comment._id} className="hover:bg-gray-800">
                  <td className="px-4 py-2 border-b">{index + 1}</td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      {comment.user?.name || 'Anonymous'}
                      {comment.user?.role === 'admin' && (
                        <span className="bg-red-500 text-xs px-2 py-0.5 rounded text-white">Admin</span>
                      )}
                      {comment.user?.role === 'author' && (
                        <span className="bg-violet-500 text-xs px-2 py-0.5 rounded text-white">Author</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 border-b italic text-sm">"{comment.text}"</td>
                  <td className="px-4 py-2 border-b">{comment.blog?.title || 'Unknown Blog'}</td>
                  <td className="px-4 py-2 border-b">{getRelativeTime(comment.createdAt)}</td>
                  <td className="px-4 py-2 border-b">
                    {canDelete(comment) ? (
                      <button
                        onClick={() => handleDelete(comment._id, comment.blog?._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-semibold"
                      >
                        <FaTrash /> Delete
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Cannot delete</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-400">
                  No comments found on your blogs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthorComments;
