import express from 'express';
import {
    createComment,
    getComments,
    voteComment,
    deleteComment
} from '../controllers/comment.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// All comment routes require authentication
router.use(authMiddleware);

// Comment routes
router.post('/posts/:postId/comments', createComment);
router.get('/posts/:postId/comments', getComments);
router.post('/comments/:commentId/vote', voteComment);
router.delete('/comments/:commentId', deleteComment);

export default router; 