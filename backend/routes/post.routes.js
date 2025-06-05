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

// Get trending posts (must be before /:id routes)
router.get("/trending", getTrendingPosts);

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected routes
router.use(authMiddleware, setUsernameMiddleware);
router.post("/create", upload.single('image'), createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.post("/:id/vote", votePost);
router.get("/:id/vote-status", getVoteStatus);

export default router;