import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: [true, "Title is required"],
        trim: true,
        minlength: [5, "Title must be at least 5 characters long"],
        maxlength: [100, "Title must be less than 100 characters long"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        minlength: [20, "Description must be at least 20 characters long"],
        maxlength: [300, "Description must be less than 300 characters long"]
    },
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    thumbnail: {
        type: String,
        required: [true, "Thumbnail image is required"]
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    authorRole: {
        type: String,
        enum: ["user", "author", "admin"],
        default: "author"
    },
    views: {
        type: Number,
        default: 0
    },
    viewers: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            ip: String,
            viewedAt: { type: Date, default: Date.now }
        }
    ],
    readTime: {
        type: Number,
        default: 1
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Calculate read time middleware
blogSchema.pre('save', function(next) {
    if (this.content) {
        // Strip HTML tags and calculate read time based on words
        // Average reading speed: 200-250 words per minute
        const text = this.content.replace(/<[^>]*>/g, '');
        // Filter out empty strings after splitting
        const words = text.split(/\s+/).filter(word => word.trim().length > 0);
        const wordCount = words.length;
        
        // Calculate readTime with a minimum of 1 minute
        const calculatedTime = Math.ceil(wordCount / 225);
        this.readTime = calculatedTime > 0 ? calculatedTime : 1; // in minutes
    } else {
        this.readTime = 1; // Default to 1 minute if no content
    }
    next();
});

export const Blog = mongoose.model("Blog", blogSchema);