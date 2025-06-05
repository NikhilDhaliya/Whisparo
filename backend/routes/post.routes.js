import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getTrendingPosts,
} from "../controllers/post.controller.js";
import { votePost, getVoteStatus } from "../controllers/vote.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { setUsernameMiddleware } from "../middlewares/setUsername.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Apply setUsernameMiddleware to all routes
router.use(setUsernameMiddleware);

// Get trending posts (must be before /:id routes)
router.get("/trending", getTrendingPosts);

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected routes
router.post("/create", authMiddleware, upload.single('image'), createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/vote", authMiddleware, votePost);
router.get("/:id/vote-status", authMiddleware, getVoteStatus);

export default router;