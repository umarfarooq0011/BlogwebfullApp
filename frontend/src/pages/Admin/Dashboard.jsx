import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaBlog,
  FaComments,
  FaUsers,
  FaEnvelope,
  FaChartBar,
  FaEye,
  FaRegFileAlt,
  FaSync,
  FaUser,
  FaNewspaper,
  FaComment,
  FaCrown
} from 'react-icons/fa';
import { AdminLoader } from '../../loaders/AdminLoader';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    userName: 'Admin',
    totalBlogs: '...',
    totalComments: '...',
    registeredUsers: '...',
    newsletterSubs: '...',
    weeklyViews: '...',
    draftBlogs: '...',
    recentActivity: []
  });

  // Function to fetch dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      
      // Get admin's name
      const userResponse = await axios.get('/api/check-auth');
      const userName = userResponse.data?.user?.name || 'Admin';
      
      // Get admin's blogs
      const blogsResponse = await axios.get('/api/blog/admin/blogs');
      const blogs = blogsResponse.data?.blogs || [];
      const totalBlogs = blogs.length.toString();
      const draftBlogs = blogs.filter(blog => !blog.isPublished).length.toString();
      const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
      const weeklyViews = Math.round(totalViews / 4).toLocaleString();
      
      // Get comments
      const commentsResponse = await axios.get('/api/blog/admin/comments');
      const comments = commentsResponse.data?.comments || [];
      const totalComments = comments.length.toString();
      
      // Get newsletter subscribers
      const subscribersResponse = await axios.get('/api/newsletter/admin/subscribers');
      const subscribers = subscribersResponse.data?.subscribers || [];
      const totalSubscribers = subscribers.length.toString();
      
      // Get user count and most recent user
      let usersCount = '0';
      let recentUser = null;
      try {
        const usersResponse = await axios.get('/api/admin/users');
        if (usersResponse.data?.success && usersResponse.data.users?.length > 0) {
          const users = usersResponse.data.users;
          usersCount = users.length.toString();
          const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          if (sortedUsers.length > 0) {
            recentUser = sortedUsers[0];
          }
        }
      } catch (error) {
        console.warn('Could not fetch all users:', error);
      }
      
      // Build recent activity with real data only
      const recentActivity = [];
      
      // Add latest blog (if exists)
      const sortedBlogs = [...blogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (sortedBlogs.length > 0) {
        const latestBlog = sortedBlogs[0];
        recentActivity.push({
          type: 'blog',
          content: 'New blog submitted by ',
          highlight: latestBlog.author?.name || 'an author'
        });
      }
      
      // Add recent user (if exists)
      if (recentUser) {
        recentActivity.push({
          type: 'user',
          content: 'New user registered: ',
          highlight: recentUser.name
        });
      }
      
      // Add recent comment (if exists)
      if (comments.length > 0) {
        const recentComment = comments[0];
        recentActivity.push({
          type: 'comment',
          content: `New comment on "`,
          highlight: `${recentComment.blog?.title || 'a blog'}"`
        });
      }
      
      // Add recent newsletter subscriber (if exists)
      if (subscribers.length > 0) {
        const recentSubscriber = subscribers[0];
        recentActivity.push({
          type: 'newsletter',
          content: 'Newsletter subscription from ',
          highlight: recentSubscriber.email
        });
      }
      
      // Update state with real data
      setDashboardData({
        userName,
        totalBlogs,
        totalComments,
        registeredUsers: usersCount,
        newsletterSubs: totalSubscribers,
        weeklyViews,
        draftBlogs,
        recentActivity
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
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
    return <AdminLoader />;
  }

  // Function to get icon component for activity type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'blog':
        return <FaNewspaper className="text-blue-400 text-xl" />;
      case 'user':
        return <FaUser className="text-green-400 text-xl" />;
      case 'comment':
        return <FaComment className="text-yellow-400 text-xl" />;
      case 'newsletter':
        return <FaEnvelope className="text-pink-400 text-xl" />;
      default:
        return <FaRegFileAlt className="text-purple-400 text-xl" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Welcome, {dashboardData.userName}</h1>
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
        <Card icon={<FaBlog />} color="text-blue-400" title="Total Blogs" count={dashboardData.totalBlogs} />
        <Card icon={<FaComments />} color="text-green-400" title="Total Comments" count={dashboardData.totalComments} />
        <Card icon={<FaUsers />} color="text-yellow-400" title="Registered Users" count={dashboardData.registeredUsers} />
        <Card icon={<FaEnvelope />} color="text-pink-400" title="Newsletter Subs" count={dashboardData.newsletterSubs} />
        <Card icon={<FaChartBar />} color="text-purple-400" title="Weekly Views" count={dashboardData.weeklyViews} />
        <Card icon={<FaRegFileAlt />} color="text-cyan-400" title="Draft Blogs" count={dashboardData.draftBlogs} />
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-300">Recent Activity</h2>
        <div className="space-y-4">
          {dashboardData.recentActivity.length > 0 ? (
            dashboardData.recentActivity.map((activity, index) => (
              <div key={index} className="bg-gray-700/60 p-4 rounded-xl shadow transition-all hover:bg-gray-700">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-white">
                      {activity.type === 'blog' && 'New Content'}
                      {activity.type === 'user' && 'New User'}
                      {activity.type === 'comment' && 'New Comment'}
                      {activity.type === 'newsletter' && 'Newsletter'}
                    </h3>
                    <p className="text-gray-300">
                      {activity.content}
                      <strong>{activity.highlight}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400">
              <p>No recent activity to show.</p>
            </div>
          )}
        </div>
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

export default Dashboard;
