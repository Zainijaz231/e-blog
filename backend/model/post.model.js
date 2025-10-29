import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title:{
        type: String,
        require: true,
        maxlength: 120,
    },
    description:{
        type: String,
        maxlength: 500,
    },
    content: {
        type: String,
        required: true,
        maxlength: 20000,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    images: [{
        type: String, // URLs to uploaded images
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 250,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    shares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isPublic: {
        type: Boolean,
        default: false,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    viewedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        viewedAt: {
            type: Date,
            default: Date.now,
        },
    }],
}, { timestamps: true });

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
    return this.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
    return this.shares.length;
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });

export const Post = mongoose.model('Post', postSchema);