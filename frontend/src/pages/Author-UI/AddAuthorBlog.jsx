import React from 'react';
import AddBlog from '../Admin/AddBlog';

const AddAuthorBlog = () => {
  // Pass the role prop to AddBlog component to indicate this is for an author
  return <AddBlog role="author" />;
};

export default AddAuthorBlog;