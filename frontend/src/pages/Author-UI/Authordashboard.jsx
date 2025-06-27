import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaBlog,
  FaComments,
  FaEye,
  FaRegFileAlt,
  FaPen,
  FaComment,
  FaTrophy,
  FaBookmark,
  FaCrown,
  FaNewspaper,
  FaSync
} from 'react-icons/fa';
import { AuthorLoader } from '../../loaders/AuthorLoader';

const AuthorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    userName: 'Author',
    totalBlogs: 0,
    comments: 0,
    views: 0,
    drafts: 0,
    recentActivity: []
  });
  const [error, setError] = useState(null);

  // Format relative time for activities
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    
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

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      
      // 1. Get user info
      const userResponse = await axios.get('/api/check-auth');
      if (!userResponse.data.success) {
        throw new Error('Failed to authenticate');
      }
      
      const userName = userResponse.data.user?.name || 'Author';
      
      // 2. Get author's blogs
      const blogsResponse = await axios.get('/api/blog/author/blogs');
      if (!blogsResponse.data.success) {
        throw new Error('Failed to fetch blogs');
      }
      
      const blogs = blogsResponse.data.blogs || [];
      const totalBlogs = blogs.length;
      const drafts = blogs.filter(blog => !blog.isPublished).length;
      const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
      
      // 3. Get comments
      const commentsResponse = await axios.get('/api/blog/author/comments');
      const comments = commentsResponse.data.comments || [];
      
      // 4. Create exactly 3 high-priority activities
      const activities = [];
      
      // Activity 1: Most recent blog post/draft
      if (blogs.length > 0) {
        // Sort blogs by creation date to get the most recent
        const sortedBlogs = [...blogs].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        const latestBlog = sortedBlogs[0];
        activities.push({
          id: `blog-${latestBlog._id}`,
          type: 'blog',
          text: `Latest ${latestBlog.isPublished ? 'published blog' : 'draft'}: "${latestBlog.title}"`,
          date: new Date(latestBlog.createdAt),
          timestamp: latestBlog.createdAt,
          priority: 1
        });
      }
      
      // Activity 2: Most recent comment
      if (comments.length > 0) {
        // Sort comments by creation date to get the most recent
        const sortedComments = [...comments].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        const latestComment = sortedComments[0];
        activities.push({
          id: `comment-${latestComment._id}`,
          type: 'comment',
          text: `Latest comment on "${latestComment.blog?.title || 'your blog'}"`,
          date: new Date(latestComment.createdAt),
          timestamp: latestComment.createdAt,
          priority: 2
        });
      }
      
      // Activity 3: Blog with highest views (most popular)
      if (blogs.length > 0) {
        const blogsSortedByViews = [...blogs].sort((a, b) => b.views - a.views);
        const mostPopularBlog = blogsSortedByViews[0];
        
        if (mostPopularBlog.views > 0) {
          activities.push({
            id: `popular-${mostPopularBlog._id}`,
            type: 'popular',
            text: `Most popular blog: "${mostPopularBlog.title}" with ${mostPopularBlog.views} views`,
            date: new Date(mostPopularBlog.updatedAt),
            timestamp: mostPopularBlog.updatedAt,
            priority: 3
          });
        }
      }
      
      // Sort activities by priority to maintain consistent order
      activities.sort((a, b) => a.priority - b.priority);
      
      // Update state with all the data
      setDashboardData({
        userName,
        totalBlogs,
        comments: comments.length,
        views: totalViews,
        drafts,
        recentActivity: activities
      });
      
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Dashboard Error:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, []);
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return <AuthorLoader />;
  }

  if (error) {
    return (
      <div className="w-full p-6 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  // Get appropriate icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'blog':
        return <FaNewspaper className="text-blue-400 text-2xl" />;
      case 'comment':
        return <FaComment className="text-green-400 text-2xl" />;
      case 'popular':
        return <FaCrown className="text-yellow-400 text-2xl" />;
      default:
        return <FaBookmark className="text-purple-400 text-2xl" />;
    }
  };

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">
          Welcome, {dashboardData.userName}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {lastUpdated && (
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button 
            onClick={handleRefresh} 
            className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${refreshing ? 'animate-spin text-blue-400' : ''}`}
            disabled={refreshing}
            title="Refresh data"
          >
            <FaSync />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card 
          icon={<FaBlog />} 
          color="text-blue-400" 
          title="Total Blogs" 
          count={dashboardData.totalBlogs} 
        />
        <Card 
          icon={<FaComments />} 
          color="text-green-400" 
          title="Total Comments" 
          count={dashboardData.comments} 
        />
        <Card 
          icon={<FaEye />} 
          color="text-purple-400" 
          title="Views" 
          count={dashboardData.views.toLocaleString()} 
        />
        <Card 
          icon={<FaRegFileAlt />} 
          color="text-yellow-400" 
          title="Drafts" 
          count={dashboardData.drafts} 
        />
      </div>

      {/* Highlights */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-300">Highlights</h2>
        {dashboardData.recentActivity.length > 0 ? (
          <div className="space-y-6">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="bg-gray-700/60 p-4 rounded-xl shadow transition-all hover:bg-gray-700">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-white">
                      {activity.type === 'blog' && 'Latest Article'}
                      {activity.type === 'comment' && 'Recent Engagement'}
                      {activity.type === 'popular' && 'Most Popular Content'}
                    </h3>
                    <p className="text-gray-300">{activity.text}</p>
                    <span className="text-xs text-gray-400 block mt-2">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No recent activity to display</p>
        )}
      </div>
    </div>
  );
};

// Reusable Card Component
const Card = ({ icon, color, title, count }) => (
  <div className="bg-gray-800 p-5 rounded-lg flex items-center gap-4 shadow-md hover:scale-[1.02] transition duration-200">
    <div className={`text-3xl ${color}`}>{icon}</div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-300 text-md">{count}</p>
    </div>
  </div>
);

export default AuthorDashboard;
