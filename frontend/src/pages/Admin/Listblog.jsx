import React, { useState, useEffect, Fragment } from 'react';
import { FaTrash, FaEyeSlash, FaEdit, FaEye, FaPencilAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';

// This Listblog component is now shared between admin and author panels. Pass role="admin" or role="author" as a prop.
const Listblog = ({ role = 'admin' }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, [role]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/blog/admin/blogs';
      if (role === 'author') {
        endpoint = '/api/blog/author/blogs';
      }
      const response = await axios.get(endpoint, {
        withCredentials: true
      });
      if (response.data.success) {
        setBlogs(response.data.blogs || []);
      } else {
        setError('Failed to load blogs');
        toast.error('Failed to load blogs');
      }
    } catch (err) {
      setError(`Error: ${err.response?.data?.message || err.message}`);
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, confirmed = false) => {
    if (!confirmed) {
      setPendingDeleteId(id);
      setShowConfirmModal(true);
      return;
    }
    setDeletingId(id);
    setShowConfirmModal(false);
    try {
      let endpoint = `/api/blog/admin/blogs/${id}`;
      if (role === 'author') {
        endpoint = `/api/blog/author/blogs/${id}`;
      }
      const response = await axios.delete(endpoint, {
        withCredentials: true
      });
      if (response.data.success) {
        toast.success('Blog deleted successfully');
        setBlogs(blogs.filter(blog => blog._id !== id));
      } else {
        toast.error('Failed to delete blog');
      }
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const newStatus = !blog.isPublished;
      let endpoint = `/api/blog/admin/blogs/${blog._id}/publish`;
      if (role === 'author') {
        endpoint = `/api/blog/author/blogs/${blog._id}/publish`;
      }
      const response = await axios.patch(endpoint, 
        { isPublished: newStatus },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(`Blog ${newStatus ? 'published' : 'unpublished'} successfully`);
        setBlogs(blogs.map(b => 
          b._id === blog._id ? { ...b, isPublished: newStatus } : b
        ));
      } else {
        toast.error('Failed to update blog status');
      }
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter blogs based on active filter
  const filteredBlogs = blogs.filter(blog => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'published') return blog.isPublished;
    if (activeFilter === 'drafts') return !blog.isPublished;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-400">All Blogs</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-400">All Blogs</h1>
        <div className="bg-red-500 bg-opacity-20 p-4 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchBlogs}
            className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-400">All Blogs</h1>

      {/* Filter tabs */}
      <div className="flex mb-6 space-x-2 overflow-x-auto pb-2">
        <button 
          className={`px-4 py-2 ${activeFilter === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`px-4 py-2 ${activeFilter === 'published' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded`}
          onClick={() => setActiveFilter('published')}
        >
          Published
        </button>
        <button 
          className={`px-4 py-2 ${activeFilter === 'drafts' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded`}
          onClick={() => setActiveFilter('drafts')}
        >
          Drafts
        </button>
      </div>

      {/* Blog count summary */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <div>
          <span className="text-gray-400">Total: {blogs.length} | </span>
          <span className="text-green-400">Published: {blogs.filter(blog => blog.isPublished).length} | </span>
          <span className="text-yellow-400">Drafts: {blogs.filter(blog => !blog.isPublished).length}</span>
        </div>
      </div>

      {/* Mobile card layout */}
      <div className="space-y-4 sm:hidden">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {activeFilter === 'all' ? 'No blogs available.' : `No ${activeFilter} blogs found.`}
          </div>
        ) : (
          filteredBlogs.map((blog) => (
            <div key={blog._id || blog.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="mb-2 flex justify-between">
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold 
                  ${blog.isPublished 
                    ? 'bg-green-600 text-white' 
                    : 'bg-yellow-600 text-white'}`}>
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-gray-400">{formatDate(blog.createdAt || blog.date)}</span>
              </div>
              <h2 className="text-lg font-semibold mb-1">{blog.title}</h2>
              {blog.description && (
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">{blog.description}</p>
              )}
              {blog.category && (
                <p className="text-xs text-gray-400 mb-3">Category: {blog.category}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleTogglePublish(blog)}
                  className={`flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 rounded font-semibold
                    ${blog.isPublished 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {blog.isPublished ? <><FaEyeSlash /> Unpublish</> : <><FaEye /> Publish</>}
                </button>
                <button
                  onClick={() => handleDelete(blog._id || blog.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold"
                  disabled={deletingId === (blog._id || blog.id)}
                >
                  {deletingId === (blog._id || blog.id) ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  ) : (
                    <>
                      <FaTrash /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-4 py-2 border-b">Title</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Category</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-400">
                  {activeFilter === 'all' ? 'No blogs available.' : `No ${activeFilter} blogs found.`}
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => (
                <tr key={blog._id || blog.id} className="hover:bg-gray-800">
                  <td className="px-4 py-3 border-b">
                    <div className="line-clamp-1">{blog.title}</div>
                  </td>
                  <td className="px-4 py-3 border-b">{formatDate(blog.createdAt || blog.date)}</td>
                  <td className="px-4 py-3 border-b">{blog.category}</td>
                  <td className="px-4 py-3 border-b">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold 
                      ${blog.isPublished 
                        ? 'bg-green-600 text-white' 
                        : 'bg-yellow-600 text-white'}`}>
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePublish(blog)}
                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded font-semibold
                          ${blog.isPublished 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'}`}
                      >
                        {blog.isPublished ? <><FaEyeSlash /> Unpublish</> : <><FaEye /> Publish</>}
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id || blog.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-semibold"
                        disabled={deletingId === (blog._id || blog.id)}
                      >
                        {deletingId === (blog._id || blog.id) ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                        ) : (
                          <>
                            <FaTrash /> Delete
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Headless UI Delete Confirmation Dialog */}
      <Transition.Root show={showConfirmModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowConfirmModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Are you sure?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Do you really want to delete this blog? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowConfirmModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      onClick={async () => {
                        await handleDelete(pendingDeleteId, true);
                      }}
                    >
                      Yes, delete it!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default Listblog;
