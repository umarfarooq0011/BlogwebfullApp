import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { FaUserCircle, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaEye, FaLock, FaPaperPlane, FaArrowUp } from "react-icons/fa";
import Footer from "../components/Footer";
import { SkeletonLoader1 } from "../components/skeletonloader";

const BlogArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const newCommentRef = useRef(null);

  // Format date to show month name, date, and year
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
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

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/check-auth');
        if (response.data && response.data.success) {
          setIsAuthenticated(true);
          setCurrentUser(response.data.user);
        }
      } catch {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/blog/BlogId/${id}`);
        
        if (response.data && response.data.success) {
          const fetchedBlog = response.data.blog;
          setArticle(fetchedBlog);
          setError(null);
        } else {
          setError("Failed to load blog post");
        }
      } catch (err) {
        setError(`Failed to load blog: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticleData();
    }
  }, [id]);

  // Show/hide scroll to top button and update progress bar
  useEffect(() => {
    const handleScroll = () => {
      // Scroll to top button logic
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // Reading progress bar logic
      const element = document.documentElement;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const scrollPosition = element.scrollTop;
      
      if (totalHeight > 0) {
        setScrollProgress((scrollPosition / totalHeight) * 100);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      return; // Only authenticated users can comment
    }
    
    if (!commentText.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Optimistically update the UI first (Facebook/Instagram-like immediate feedback)
      const optimisticComment = {
        _id: 'temp-' + Date.now(),
        text: commentText,
        createdAt: new Date(),
        isOptimistic: true, // Flag to style differently until confirmed
        user: {
          name: currentUser?.name || 'You',
          role: currentUser?.role || 'author'
        }
      };
      
      // Update the article state with the new comment
      setArticle(prevArticle => ({
        ...prevArticle,
        comments: [...(prevArticle.comments || []), optimisticComment]
      }));
      
      // Clear the comment form
      setCommentText("");
      
      // Now send the request to the server
      const response = await axios.post(`/api/blog/blogs/${id}/comments`, {
        text: commentText
      }, {
        withCredentials: true
      });
      
      if (response.data && response.data.success) {
        // Update the optimistic comment with the real one
        setArticle(prevArticle => {
          const updatedComments = prevArticle.comments.map(comment => 
            comment._id === optimisticComment._id ? response.data.comment : comment
          );
          return {
            ...prevArticle,
            comments: updatedComments
          };
        });
      }
    } catch (error) {
      // If the request fails, remove the optimistic comment
      setArticle(prevArticle => ({
        ...prevArticle,
        comments: prevArticle.comments.filter(c => c._id !== 'temp-' + Date.now())
      }));
      
      console.error("Comment submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <SkeletonLoader1 />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl text-red-400 mb-4">{error || "Blog post not found"}</h2>
        <button 
          onClick={() => window.history.back()} 
          className="bg-violet-500 px-4 py-2 rounded-lg hover:bg-violet-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Prepare sharing information
  const articleUrl = window.location.href;
  const articleTitle = article.title;
  const authorName = article.author?.name || (article.authorRole === "admin" ? "Admin" : "Author");
  const articleDescription = article.description;
  const shareText = `Check out this article: "${articleTitle}" by ${authorName}`;
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-700 z-50">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-75" 
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">

        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-400">
              Published on {formatDate(article.createdAt)}
            </p>
            <span className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full text-base font-semibold text-violet-400 shadow-sm border border-violet-500">
              <FaEye className="inline-block text-lg" />
              <span>{article.views || 0} views</span>
            </span>
            <span className="bg-gray-700 px-3 py-1 rounded-full text-violet-400 border border-violet-500">
              {article.readTime} min read
            </span>
          </div>
          <h1 className="text-4xl font-extrabold leading-snug">{article.title}</h1>
          <h2 className="text-lg text-gray-300 font-light">{article.description}</h2>
          <div className="flex gap-2 flex-wrap">
            <span className="inline-block bg-violet-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {article.author && article.author.name ? `${article.author.name}` : article.authorRole === "admin" ? "Admin" : "Author"}
            </span>
            <span className="inline-block bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {article.category}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        <img 
          className="w-full rounded-3xl shadow-xl" 
          src={article.thumbnail} 
          alt={article.title} 
        />

        {/* Article Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        >
        </div>

        {/* Comments Display */}
        <div className="bg-gray-800 p-8 rounded-3xl shadow-md space-y-6">
          <h3 className="text-2xl font-bold text-white">Comments ({article.comments?.length || 0})</h3>
          {article.comments && article.comments.length > 0 ? (
            article.comments.map((comment, i) => (
              <div 
                key={comment._id || i} 
                className={`bg-gray-700/70 p-5 rounded-2xl shadow-sm transition duration-500 ${comment.isOptimistic ? 'animate-pulse bg-opacity-50' : ''}`}
                ref={i === article.comments.length - 1 ? newCommentRef : null}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${comment.user?.role === 'admin' ? 'bg-red-500' : 'bg-violet-500'}`}>
                      {comment.user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white">
                        {comment.user?.name || "Anonymous"}
                      </span>
                      {comment.user?.role === 'admin' && 
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">Admin</span>
                      }
                      {comment.user?.role === 'author' && 
                        <span className="ml-2 text-xs bg-violet-500 text-white px-2 py-0.5 rounded">Author</span>
                      }
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {getRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-300 ml-14">{comment.text}</p>
              </div>
            ))
          ) : (
            <div className="bg-gray-700/50 p-6 rounded-2xl text-center">
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-md">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                <span>{currentUser?.name?.charAt(0).toUpperCase() || "O"}</span>
              </div>
              <form onSubmit={handleSubmitComment} className="w-full relative">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="w-full bg-gray-800 text-white py-3 px-6 pr-14 rounded-full border-2 border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-gray-400"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button 
                    type="submit" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !commentText.trim()}
                    aria-label="Submit comment"
                  >
                    <FaPaperPlane className="text-xl" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-700/70 p-6 rounded-2xl">
              <div className="flex items-center gap-3 text-yellow-400 mb-3">
                <FaLock className="text-xl" />
                <p className="font-medium">Authentication Required</p>
              </div>
              <p className="text-gray-300 mb-5">You need to be logged in to post comments.</p>
              <div className="flex gap-4">
                <Link to="/login" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold transition">
                  Log In
                </Link>
                <Link to="/signup" className="bg-transparent border border-violet-400 text-violet-400 hover:bg-violet-900 hover:text-white px-6 py-2.5 rounded-xl font-semibold transition">
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Share This Article */}
        <div className="bg-gray-800 p-8 rounded-3xl shadow-md space-y-6">
          <h4 className="text-xl font-semibold text-white">Share this article</h4>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}&quote=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FaFacebookF className="text-lg" /> Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(`${shareText}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white bg-sky-500 px-4 py-2 rounded-lg hover:bg-sky-600 transition"
            >
              <FaTwitter className="text-lg" /> Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                // Try a more direct approach using the newer LinkedIn sharing API
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(articleTitle)}&summary=${encodeURIComponent(`${articleDescription} - By ${authorName}`)}`,
                  'linkedinshare',
                  'width=650,height=500,left=0,top=0,location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1'
                );
              }}
              className="flex items-center gap-2 text-white bg-blue-800 px-4 py-2 rounded-lg hover:bg-blue-900 transition"
            >
              <FaLinkedinIn className="text-lg" /> LinkedIn
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${articleUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <FaWhatsapp className="text-lg" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-14 h-14 bg-violet-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-violet-700 transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-2xl" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default BlogArticle;
