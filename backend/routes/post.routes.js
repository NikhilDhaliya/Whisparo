import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";
import { votePost, getVoteStatus } from "../controllers/vote.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { setUsernameMiddleware } from "../middlewares/setUsername.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Vote routes
router.post("/:id/vote", authMiddleware, votePost);
router.get("/:id/vote-status", authMiddleware, getVoteStatus);

router.post("/create", authMiddleware, setUsernameMiddleware, createPost);
router.put("/:id", authMiddleware, setUsernameMiddleware, updatePost);
router.delete("/:id", authMiddleware, setUsernameMiddleware, deletePost);

export default router;