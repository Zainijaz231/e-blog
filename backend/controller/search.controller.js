import { Post } from "../model/post.model.js";
import { User } from "../model/user.model.js";

const SearchPosts = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchRegex = new RegExp(q, 'i'); // Case insensitive search

        const posts = await Post.find({
            $and: [
                { isPublic: true },
                {
                    $or: [
                        { title: { $regex: searchRegex } },
                        { description: { $regex: searchRegex } },
                        { content: { $regex: searchRegex } },
                        { tags: { $in: [searchRegex] } }
                    ]
                }
            ]
        })
        .populate("author", "name username avatarUrl")
        .sort({ createdAt: -1 })
        .limit(20);

        res.status(200).json({ 
            posts,
            count: posts.length,
            query: q
        });
    } catch (error) {
        console.error("Error searching posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const SearchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchRegex = new RegExp(q, 'i'); // Case insensitive search

        const users = await User.find({
            $or: [
                { name: { $regex: searchRegex } },
                { username: { $regex: searchRegex } },
                { bio: { $regex: searchRegex } }
            ]
        })
        .select('-password')
        .limit(20);

        res.status(200).json({ 
            users,
            count: users.length,
            query: q
        });
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const SearchAll = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchRegex = new RegExp(q, 'i');

        // Search posts
        const posts = await Post.find({
            $and: [
                { isPublic: true },
                {
                    $or: [
                        { title: { $regex: searchRegex } },
                        { description: { $regex: searchRegex } },
                        { content: { $regex: searchRegex } },
                        { tags: { $in: [searchRegex] } }
                    ]
                }
            ]
        })
        .populate("author", "name username avatarUrl")
        .sort({ createdAt: -1 })
        .limit(10);

        // Search users
        const users = await User.find({
            $or: [
                { name: { $regex: searchRegex } },
                { username: { $regex: searchRegex } },
                { bio: { $regex: searchRegex } }
            ]
        })
        .select('-password')
        .limit(10);

        res.status(200).json({ 
            posts,
            users,
            postsCount: posts.length,
            usersCount: users.length,
            query: q
        });
    } catch (error) {
        console.error("Error searching:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { SearchPosts, SearchUsers, SearchAll };