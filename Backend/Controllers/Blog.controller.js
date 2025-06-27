import fs from "fs";
import imagekit from "../DB/imagekit.js";
import { Blog } from "../Models/Blog.model.js";
import { User } from "../Models/user.model.js";
import { Newsletter } from '../Models/newsletter.model.js';
import { sendNewPostEmail } from '../Mails/emails.js';
import ImageKit from "imagekit";
import main from "../DB/gemini.js";

export const addBlog = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      thumbnail,
      category,
      isPublished,
      role,
    } = JSON.parse(req.body.blog);
    const imageFile = req.file;
    const userId = req.userId; // Get the userId from the request (set by verifyToken middleware)
    let userRole = req.userRole; // Get the user role from the request

    // If role is explicitly provided in the request body, use that instead
    // This allows the frontend to override the role based on which interface is being used
    if (role === "admin" || role === "author") {
      userRole = role;
    }

    // Check if all fields are provided
    if (
      !title ||
      !description ||
      !content ||
      !thumbnail ||
      !category ||
      isPublished === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Upload the image to ImageKit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogsImages",
    });

    // optimization through imagekit URL transformation
    const optimizedImageUrl = imagekit.url({
      path: uploadResponse.filePath,
      transformation: [
        { quality: "auto" }, // auto quality
        { format: "webp" }, // webp format
        { width: "1280" }, // 1280px width
      ],
    });

    const image = optimizedImageUrl;

    // Log the user role for debugging
    // console.log(`Creating blog with author role: ${userRole}`);

    // Create the blog post
    const newBlog = await Blog.create({
      title,
      description,
      content,
      thumbnail: image,
      category,
      isPublished,
      author: userId, // Set the author to the authenticated user's ID
      authorRole: userRole || "author", // Add the user's role to distinguish between admin/author posts
    });

    // Clean up the temporary file after upload
    if (imageFile.path) {
      try {
        fs.unlinkSync(imageFile.path);
      } catch (err) {
        console.error("Error deleting temp file:", err);
        // Non-critical error, continue execution
      }
    }

    // If the blog is published, send email to subscribers
    if (newBlog.isPublished) {
      try {
        const subscribers = await Newsletter.find({}, 'email');
        const recipientEmails = subscribers.map(sub => sub.email);
        
        if (recipientEmails.length > 0) {
          await sendNewPostEmail(recipientEmails, newBlog);
        }
      } catch (emailError) {
        console.error("Failed to send newsletter email:", emailError);
        // Don't block the response for this, just log the error
      }
    }

    return res.status(201).json({
      message: "Blog created successfully",
      success: true,
      blog: {
        id: newBlog._id,
        title: newBlog.title,
        isPublished: newBlog.isPublished,
        authorRole: newBlog.authorRole,
        readTime: newBlog.readTime || 1,
      },
    });
  } catch (error) {
    // Log error silently or to a file instead of console
    return res.status(500).json({
      message: "Internal server error,  error: " + error.message,
      success: false,
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true, deleted: false })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Blogs fetched successfully",
      success: true,
      blogs: blogs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error,  error: " + error.message,
      success: false,
    });
  }
};

export const getBlogById = async (req, res) => {
  const { BlogId } = req.params;
  try {
    const blog = await Blog.findById(BlogId)
      .populate('author', 'name')
      .populate('comments.user', 'name role');
    
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }

    // GET USER ID IF LOGGED IN, ELSE GET IP ADDRESS
    const userId =  req.user ? req.user._id : null;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

     // Check if this user/IP has viewed in the last 24 hours
     const now = new Date();
     const thirtyMinutes = new Date(now.getTime() - 30 *60* 1000); // 30 minutes ago

    // CHECK IF USER/IP HAS VIEWED THE BLOG
     let alreadyViewed = false;
     if(userId){
      alreadyViewed = blog.viewers.some(v=>v.user && v.user.equals(userId)&&v.viewedAt > thirtyMinutes);
     } else{
      alreadyViewed = blog.viewers.some(v=>v.ip === ip && v.viewedAt > thirtyMinutes);
     }
     if(!alreadyViewed){
      // Increment views and add viewer
      blog.views+=1;
      blog.viewers.push({
        user: userId,
        ip: userId ? null : ip,
        viewedAt: now
      });

      // Remove viewers older than 7 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      blog.viewers = blog.viewers.filter(v => v.viewedAt > sevenDaysAgo);

      await blog.save();
     }

    return res.status(200).json({
      message: "Blog fetched successfully",
      success: true,
      blog: blog,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error,  error: " + error.message,
      success: false,
    });
  }
};

// Update getAdminBlogs to show all blogs (admin sees all, including admin and author posts)
export const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ deleted: false })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Admin blogs fetched successfully",
      success: true,
      blogs: blogs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
      success: false,
    });
  }
};

// Update getAuthorBlogs so authors only see their own posts (not admin's)
export const getAuthorBlogs = async (req, res) => {
  try {
    const userId = req.userId;
    // Only show blogs where author is the user and authorRole is 'author'
    const blogs = await Blog.find({ author: userId, authorRole: 'author', deleted: false })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Author blogs fetched successfully",
      success: true,
      blogs: blogs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
      success: false,
    });
  }
};

// Delete a blog (with proper authorization)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }
    if (userRole !== "admin" && blog.author.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this blog",
        success: false,
      });
    }
    await Blog.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Blog deleted successfully (hard delete)",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
      success: false,
    });
  }
};

// Toggle publish status of a blog (with proper authorization)
export const togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;
    
    if (isPublished === undefined) {
      return res.status(400).json({
        message: "isPublished field is required",
        success: false,
      });
    }
    
    // Find the blog first
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }
    
    // Check authorization - admin can update any blog, authors can only update their own
    if (userRole !== "admin" && blog.author.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this blog",
        success: false,
      });
    }
    
    // Update the publish status
    blog.isPublished = isPublished;
    await blog.save();
    
    return res.status(200).json({
      message: `Blog ${isPublished ? 'published' : 'unpublished'} successfully`,
      success: true,
      blog: {
        id: blog._id,
        isPublished: blog.isPublished,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
      success: false,
    });
  }
};

// Utility function for testing: ensure author cannot access or modify posts they do not own
export const testAuthorCannotAccessOthersBlog = async (authorId, blogId) => {
  const blog = await Blog.findById(blogId);
  if (!blog) return true; // If blog doesn't exist, author can't access
  return blog.author.toString() !== authorId;
};

// Add a comment to a blog post (requires authentication)
export const addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { text } = req.body;
    const userId = req.userId; // From verifyToken middleware

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
        success: false,
      });
    }

    // Find the blog post
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }

    // Create and add the comment
    const newComment = {
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    };

    blog.comments.push(newComment);
    await blog.save();

    // Populate user information in the new comment for the response
    const populatedBlog = await Blog.findById(blogId)
      .populate({
        path: 'comments.user',
        select: 'name role'
      });

    const addedComment = populatedBlog.comments[populatedBlog.comments.length - 1];

    return res.status(201).json({
      message: "Comment added successfully",
      success: true,
      comment: addedComment
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
      success: false,
    });
  }
};

// Admin: Get all comments from all blogs
export const getAdminComments = async (req, res) => {
  try {
    // Get all blogs and populate the comments with user information
    const blogs = await Blog.find({ deleted: false })
      .populate('author', 'name role')
      .populate('comments.user', 'name role');

    // Extract and flatten all comments from all blogs
    const allComments = blogs.reduce((acc, blog) => {
      const commentsWithBlogInfo = blog.comments.map(comment => ({
        ...comment.toObject(),
        blog: {
          _id: blog._id,
          title: blog.title
        }
      }));
      return [...acc, ...commentsWithBlogInfo];
    }, []);

    // Sort by date, newest first
    allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      comments: allComments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching comments: " + error.message
    });
  }
};

// Author: Get comments from blogs where user is the author
export const getAuthorComments = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all blogs by this author
    const authorBlogs = await Blog.find({ 
      author: userId, 
      authorRole: 'author',
      deleted: false 
    })
    .populate('author', 'name role')
    .populate('comments.user', 'name role');

    // Extract and flatten all comments from author's blogs
    const authorComments = authorBlogs.reduce((acc, blog) => {
      const commentsWithBlogInfo = blog.comments.map(comment => ({
        ...comment.toObject(),
        blog: {
          _id: blog._id,
          title: blog.title
        }
      }));
      return [...acc, ...commentsWithBlogInfo];
    }, []);

    // Sort by date, newest first
    authorComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      comments: authorComments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching comments: " + error.message
    });
  }
};

// Admin: Delete any comment
export const adminDeleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    
    // Find blog containing this comment
    const blog = await Blog.findOne({ 
      "comments._id": commentId,
      deleted: false
    });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }
    
    // Remove the comment
    blog.comments = blog.comments.filter(comment => 
      comment._id.toString() !== commentId
    );
    
    await blog.save();
    
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting comment: " + error.message
    });
  }
};

// Author: Delete comments on their own blogs (except admin comments)
export const authorDeleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const blogId = req.query.blogId;
    const userId = req.userId;
    
    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required"
      });
    }
    
    // First, find the blog and verify the author owns it
    const blog = await Blog.findOne({ 
      _id: blogId,
      author: userId,
      authorRole: 'author',
      deleted: false
    });
    
    if (!blog) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete comments on this blog"
      });
    }
    
    // Find the comment and check if it's from an admin (cannot delete admin comments)
    await Blog.populate(blog, {
      path: 'comments.user',
      select: 'role'
    });
    
    const comment = blog.comments.find(c => c._id.toString() === commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }
    
    // Check if comment is from an admin
    if (comment.user && comment.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete admin comments"
      });
    }
    
    // Remove the comment
    blog.comments = blog.comments.filter(c => 
      c._id.toString() !== commentId
    );
    
    await blog.save();
    
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting comment: " + error.message
    });
  }
};



export const generateBlogContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    const content = await main(prompt+'Generate a blog post about the following topic');
    return res.status(200).json({
      success: true,
      message: "Blog content generated successfully",
      content: content
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error generating blog content: " + error.message
    });
  }
}
