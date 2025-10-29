import { Post } from "../model/post.model.js";
import { User } from "../model/user.model.js";

const CreatePost = async (req, res) => {
    try {
        const { content, isPublic, title, description } = req.body;
        console.log(req.body)

        if (!title) {
            return res.status(401).json({ message: "title cannot be empty" })
        }

        if (!content?.trim()) {
            return res.status(401).json({ message: "Post cannot be empty" })
        }

        const userId = req.user?._id
        if (!userId) {
            return res.status(404).json({ message: "Unauthorized: user not found" })
        }

        const imagePaths = req.files ? req.files.map(file => file.path) : [];
        const post = await Post.create({
            author: userId,
            title,
            description,
            content,
            images: imagePaths,
            isPublic: isPublic ?? true,
        })
        res.status(201).json({ message: "Post created successfully", post: post });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const GetAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({ isPublic: true })
            .populate('author', 'username avatarUrl')
            .sort({ createdAt: -1 })

        res.status(200).json({ posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const GetUserPosts = async (req, res) => {
    try {
        const { username } = req.params

        const user = await User.findOne({ username })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const posts = await Post.find({ author: user._id })
            .populate("author", "username avatarUrl")
            .sort({ createdAt: -1 });

        res.status(200).json({ posts });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const GetPostDetails = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .populate("author", "name username avatarUrl")
            .populate("comments.user", "name username avatarUrl");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ post });
    } catch (error) {
        console.error("Error fetching post details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const GetFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get current user with following list
        const currentUser = await User.findById(userId).populate('following', '_id');

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get IDs of users that current user follows
        const followingIds = currentUser.following.map(user => user._id);

        // Find posts from followed users
        const posts = await Post.find({
            author: { $in: followingIds },
            isPublic: true
        })
            .populate("author", "name username avatarUrl")
            .sort({ createdAt: -1 });

        res.status(200).json({ posts });
    } catch (error) {
        console.error("Error fetching following posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const ToggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes.pull(userId);
            await post.save()
            return res.status(200).json({ message: "Post unliked" });
        } else {
            post.likes.push(userId);
            await post.save();
            return res.status(200).json({ message: "Post liked" });
        }

    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Internal server error" });

    }
}

const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user._id

        if (!content) return res.status(400).json({ message: "Comment cannot be empty" });

        const post = await Post.findById(postId)
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.comments.push({ user: userId, content })
        await post.save();
        res.status(200).json({ message: "Comment added", post });


    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user._id

        const post = await Post.findById(postId)
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = post.comments.id(commentId)

        if (comment.user.toString() !== userId.toString() && post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        comment.deleteOne();


        await post.save();

        res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this post" });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const UpdatePost = async (req, res) => {
    try {
        const { postId } = req.params
        const { content, title, description } = req.body;

        const userId = req.user._id

        const post = await Post.findById(postId);

        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this post" });
        }

        if (content || title || description) {
            post.content = content
            post.title = title
            post.description = description
        }

        if (req.files && req.files.length > 0) {
            const imagePaths = req.files.map(file => file.path);
            post.images = imagePaths;
        }

        await post.save();

        res.status(200).json({
            message: "Post updated successfully",
            post,
        });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const trackPostView = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?._id; // Optional for anonymous views

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user already viewed this post recently (within last hour)
        if (userId) {
            const recentView = post.viewedBy.find(view =>
                view.user?.toString() === userId.toString() &&
                new Date() - new Date(view.viewedAt) < 3600000 // 1 hour
            );

            if (!recentView) {
                // Add new view record
                post.viewedBy.push({ user: userId });
                post.viewCount += 1;
                await post.save();
            }
        } else {
            // Anonymous view - just increment count
            post.viewCount += 1;
            await post.save();
        }

        res.status(200).json({
            message: "View tracked successfully",
            viewCount: post.viewCount
        });
    } catch (error) {
        console.error("Error tracking post view:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const GetComments = async (req, res) => {
    try {
        const { postId } = req.params;

        // Fetch all comments for this post
        const comments = await Comment.find({ postId })
            .populate("author", "username avatarUrl")
            .sort({ createdAt: -1 });

        if (!comments.length) {
            return res.status(404).json({ message: "No comments yet" });
        }

        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Server error while fetching comments" });
    }
};

export { CreatePost, GetAllPosts, GetComments, GetUserPosts, GetPostDetails, GetFollowingPosts, ToggleLike, addComment, deleteComment, deletePost, UpdatePost, trackPostView }