import express from 'express';
import { register, login, logout, getUser,  resetPassword,  GetProfile, UpdateProfile, FollowToggle , GetFollowers, GetFollowing} from '../controller/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { uploads } from '../middleware/multer-storage-cloudinary.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user', authMiddleware, getUser);
router.post('/reset-password', resetPassword);
router.put('/update-profile', authMiddleware, uploads.single("avatar"), UpdateProfile);
router.get('/profile/:username', GetProfile);
router.post('/profile/:username/follow', authMiddleware, FollowToggle)
router.get('/profile/:username/followers', authMiddleware ,GetFollowers )
router.get('/profile/:username/following', authMiddleware,GetFollowing )

export default router; 
