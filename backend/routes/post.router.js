import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { uploads } from '../middleware/multer-storage-cloudinary.js';
import { CreatePost, GetAllPosts, GetUserPosts, GetPostDetails, GetFollowingPosts, ToggleLike, addComment, deleteComment, deletePost, UpdatePost, trackPostView } from '../controller/post.controller.js'

const router = express.Router();

router.post('/create-post', authMiddleware, uploads.array("imageUrl", 5), CreatePost)
router.get('/', GetAllPosts)
router.get('/following', authMiddleware, GetFollowingPosts)
router.get('/details/:postId', GetPostDetails)
router.get('/:username',  GetUserPosts)
router.post('/:postId/like', authMiddleware, ToggleLike);
router.post('/:postId/comment', authMiddleware, addComment);
router.post('/:postId/view', (req, res, next) => {
    // Optional auth middleware - doesn't fail if no token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        authMiddleware(req, res, next);
    } else {
        next();
    }
}, trackPostView);
router.delete("/:postId/comments/:commentId", authMiddleware, deleteComment);
router.delete("/:postId", authMiddleware, deletePost);
router.put("/:postId", authMiddleware, uploads.array("imageUrl", 5), UpdatePost);

export default router;
