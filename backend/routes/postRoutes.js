const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Get trending posts
router.get('/trending', postController.getTrendingPosts);

module.exports = router; 