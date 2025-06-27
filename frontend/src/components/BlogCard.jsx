import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';

const BlogCard = ({ blog }) => {
  const { title, description, category, image, id } = blog;

  const navigate = useNavigate()

  return (
    <motion.div
        onClick={() => navigate(`/blog/${id}`)}
      className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <img src={image} alt={title} className="w-full h-48 object-cover rounded-t-lg mb-4" />
      <div className="p-6">
        <span className="text-sm text-gray-500 mb-2 block" style={{ fontFamily: 'Arial, sans-serif' }}>
          {category}
        </span>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800" style={{ fontFamily: 'Arial, sans-serif' }}>
          {title}
        </h2>
        <p className="text-gray-700 mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
          {description.slice(0, 80)}...
        </p>
      </div>
    </motion.div>
  );
};

export default BlogCard;
