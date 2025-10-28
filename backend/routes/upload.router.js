import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { uploads } from '../middleware/multer-storage-cloudinary.js';

const router = express.Router();

// Upload single image for TinyMCE editor
router.post('/image', authMiddleware, uploads.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: req.file.path
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;