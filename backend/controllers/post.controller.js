import Post from "../models/post.js";

export const createPost = async (req, res) => {
  try {
    const { title, body, category } = req.body;
    const authorEmail = req.user.email; // from authMiddleware

    if (!title || !body || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPost = await Post.create({
      title,
      body,
      category,
      authorEmail
    });

    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const userEmail = req.user?.email; // Optional chaining since this endpoint might be public
    const posts = await Post.find().sort({ createdAt: -1 });
    
    // Transform posts to include vote information
    const postsWithVotes = posts.map(post => ({
      ...post.toObject(),
      votes: {
        score: post.votes.score,
        userVote: userEmail ? (
          post.votes.upvotes.includes(userEmail) ? 'upvote' : 
          post.votes.downvotes.includes(userEmail) ? 'downvote' : null
        ) : null
      }
    }));

    res.status(200).json(postsWithVotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email; // Optional chaining since this endpoint might be public
    
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Transform post to include vote information
    const postWithVotes = {
      ...post.toObject(),
      votes: {
        score: post.votes.score,
        userVote: userEmail ? (
          post.votes.upvotes.includes(userEmail) ? 'upvote' : 
          post.votes.downvotes.includes(userEmail) ? 'downvote' : null
        ) : null
      }
    };

    res.status(200).json(postWithVotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, category } = req.body;
    const userEmail = req.user.email;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorEmail !== userEmail) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    post.title = title || post.title;
    post.body = body || post.body;
    post.category = category || post.category;

    await post.save();

    res.status(200).json({ message: "Post updated", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorEmail !== userEmail) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
