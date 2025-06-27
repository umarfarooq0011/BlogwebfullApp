import React, { useState } from 'react';
import axios from 'axios';

const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await axios.post('/api/newsletter/subscribe', { email });
      if (response.data.success) {
        setMessage(response.data.message);
        setIsError(false);
        setEmail(''); // Clear email on success
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-12 px-4 bg-gray-800 text-white">
      <div className="w-full max-w-4xl bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
        <h2 className="text-4xl font-extrabold mb-3 text-white leading-tight">Subscribe to our Newsletter</h2>
        <p className="mb-8 text-lg text-gray-300">Stay updated with the latest news and articles.</p>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-5 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-violet-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-violet-600 transition-colors shadow-md disabled:bg-gray-600"
            disabled={loading}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center font-semibold ${isError ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsLetter;
