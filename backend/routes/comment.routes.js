import express from 'express';
import {
    createComment,
    getComments,
    voteComment,
    deleteComment,
    getCommentsByUser
} from '../controllers/comment.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/posts/:postId', getComments);

// Protected routes
router.post('/posts/:postId', createComment);
router.post('/:commentId/vote', voteComment);
router.delete('/:commentId', deleteComment);
router.get('/user', getCommentsByUser);

export default router; 