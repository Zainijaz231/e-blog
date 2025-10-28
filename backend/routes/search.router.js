import express from 'express';
import { SearchPosts, SearchUsers, SearchAll } from '../controller/search.controller.js';

const router = express.Router();

// Search routes
router.get('/posts', SearchPosts);
router.get('/users', SearchUsers);
router.get('/all', SearchAll);

export default router;