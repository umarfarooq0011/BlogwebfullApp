import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SkeletonLoader } from '../components/skeletonloader';
import { FaSearch, FaUser, FaClock, FaChevronDown } from "react-icons/fa";

const BlogList = () => {
  // Default categories to show before we fetch dynamic ones
  const [blogCategories, setBlogCategories] = useState(["All"]);
  const CATEGORY_THRESHOLD = 6; // Show dropdown if categories exceed this number
  
  const [menu, setMenu] = useState("All");
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // State to track if the horizontal category list is overflowing
  const [isOverflowing, setIsOverflowing] = useState(false);
  const listContainerRef = useRef(null);

  // Format date to show month name, date, and year
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Extract unique categories from blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/blog/AllBlogs");
        
        if (response.data && response.data.success) {
          const fetchedBlogs = response.data.blogs || [];
          setBlogs(fetchedBlogs);
          
          // Extract unique categories from blogs
          if (fetchedBlogs.length > 0) {
            const uniqueCategories = ["All", ...new Set(fetchedBlogs.map(blog => blog.category))];
            setBlogCategories(uniqueCategories);
          }
          
          setError(null);
        } else {
          setError("Failed to load blogs. API returned an error.");
        }
      } catch (err) {
        setError(`Failed to load blogs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Effect to detect overflow on the category list
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        // If the content height is greater than the container's visible height, it's wrapping/overflowing.
        const isContentOverflowing = entry.target.scrollHeight > entry.target.clientHeight;
        if (isContentOverflowing !== isOverflowing) {
            setIsOverflowing(isContentOverflowing);
        }
      }
    });

    if (listContainerRef.current) {
      observer.observe(listContainerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [blogs, isOverflowing]); // Rerun when blogs fetch completes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter blog cards based on selected category and search term
  const filteredBlogs = blogs.filter(blog => {
    const categoryMatch = menu === "All" || blog.category === menu;
    const searchMatch = searchTerm === "" || 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-800 text-white">
      {loading ? (
        <SkeletonLoader />
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-violet-500 px-4 py-2 rounded-lg hover:bg-violet-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="p-4 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white px-5 py-3 pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="my-8 px-4 relative">
            {/* Mobile Dropdown / Desktop Fallback Dropdown */}
            <div className={`px-4 ${isOverflowing ? 'block' : 'sm:hidden'}`} ref={dropdownRef}>
              <div className="relative max-w-xs mx-auto">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 flex justify-between items-center"
                >
                  <span>{menu === "All" ? "All Categories" : menu}</span>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 overflow-y-auto max-h-60"
                    >
                      {blogCategories.map((item) => (
                        <div
                          key={item}
                          onClick={() => {
                            setMenu(item);
                            setIsDropdownOpen(false);
                          }}
                          className="px-4 py-3 text-white hover:bg-violet-600 cursor-pointer"
                        >
                          {item}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Horizontal list for larger screens (used for measurement and display) */}
            <div
              ref={listContainerRef}
              className={`hidden ${isOverflowing ? 'sm:hidden' : 'sm:flex'} justify-center flex-wrap sm:gap-3 md:gap-6 lg:gap-5 xl:gap-5`}
            >
              {blogCategories.map((item) => (
                <div key={item} className="relative mb-2">
                  <motion.button
                    onClick={() => setMenu(item)}
                    className={`p-2 text-amber-50 cursor-pointer transition-colors duration-300 ease-in-out ${
                      menu === item
                        ? "border-2 border-violet-500 rounded-full"
                        : ""
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item}
                    <motion.div className="absolute left-0 right-0 top-0 h-7"></motion.div>
                  </motion.button>
                </div>
              ))}
            </div>
          </div>

          {/* Blog grid */}
          <div className="p-4 md:p-8">
            {blogs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xl">No blogs found</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-10">
                {searchTerm ? (
                  <p className="text-xl">No blogs found matching "{searchTerm}"</p>
                ) : (
                  <p className="text-xl">No blogs found in category: {menu}</p>
                )}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {filteredBlogs.map((blog) => (
                  <motion.div
                    key={blog._id}
                    className="bg-gray-700 rounded-lg shadow-lg overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => navigate(`/blog/${blog._id}`)}
                  >
                    <img
                      src={blog.thumbnail}
                      alt={blog.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="inline-block bg-violet-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {blog.category}
                        </span>
                        <span className="text-xs text-gray-400">{blog.readTime} min read</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                      <p className="text-gray-300 text-sm line-clamp-2">{blog.description}</p>
                      
                      <div className="mt-3 flex justify-between items-center text-xs">
                       
                        <div className="flex items-center text-gray-400">
                          <FaClock className="inline mr-1" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BlogList;
