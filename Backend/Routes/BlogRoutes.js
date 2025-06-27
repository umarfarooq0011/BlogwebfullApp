import express from "express";
import { 
  addBlog, 
  getAllBlogs, 
  getBlogById, 
  getAdminBlogs, 
  getAuthorBlogs, 
  deleteBlog, 
  togglePublishStatus,
  addComment,
  getAdminComments,
  getAuthorComments,
  adminDeleteComment,
  authorDeleteComment,
  generateBlogContent
} from "../Controllers/Blog.controller.js";
import { upload } from "../Middlewares/multer.js";
import { verifyToken } from "../Middlewares/verifyToken.js";
import { isAdmin } from "../Admin/adminMiddleware.js";

const blogRouter = express.Router();

// Public routes - no authentication required
blogRouter.get("/AllBlogs", getAllBlogs); // Only returns published blogs
blogRouter.get("/BlogId/:BlogId", getBlogById);

// Post a new blog - requires authentication
blogRouter.post("/addblog", verifyToken, upload.single("thumbnail"), addBlog);

// Admin routes - require admin role
blogRouter.get("/admin/blogs", verifyToken, isAdmin, getAdminBlogs);
blogRouter.delete("/admin/blogs/:id", verifyToken, isAdmin, deleteBlog);
blogRouter.patch("/admin/blogs/:id/publish", verifyToken, isAdmin, togglePublishStatus);
blogRouter.get("/admin/comments", verifyToken, isAdmin, getAdminComments);
blogRouter.delete("/admin/comments/:commentId", verifyToken, isAdmin, adminDeleteComment);

// Generate content though gemini both admin and author
blogRouter.post("/generate-content", verifyToken, generateBlogContent);



// Author routes - require authentication (any author can access their own blogs)
blogRouter.get("/author/blogs", verifyToken, getAuthorBlogs);
blogRouter.delete("/author/blogs/:id", verifyToken, deleteBlog);
blogRouter.patch("/author/blogs/:id/publish", verifyToken, togglePublishStatus);
blogRouter.get("/author/comments", verifyToken, getAuthorComments);
blogRouter.delete("/author/comments/:commentId", verifyToken, authorDeleteComment);

// Comment routes - require authentication
blogRouter.post("/blogs/:blogId/comments", verifyToken, addComment);



// Test endpoint to check user role 
blogRouter.get("/checkRole", verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    userId: req.userId,
    userRole: req.userRole,
    message: `Your role is: ${req.userRole}`
  });
});

export default blogRouter;  