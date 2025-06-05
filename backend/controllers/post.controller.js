import Post from "../models/post.js";
import Comment from "../models/comment.js";

export const createPost = async (req, res) => {
  try {
    const {body, category } = req.body;
    const authorEmail = req.user.email; // from authMiddleware
    
    // Get username from cookie
    const usernameCookie = req.cookies.username;
    let username = 'Anonymous';
    if (usernameCookie) {
      try {
        const parsed = JSON.parse(usernameCookie);
        const age = Date.now() - parsed.timestamp;
        if (age < 30 * 60 * 1000) {
          username = parsed.username;
        }
      } catch (e) {
        console.error('Error parsing username cookie:', e);
      }
    }

    if (!body || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPost = await Post.create({
      body,
      category,
      authorEmail,
      authorUsername: username
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || 'latest';
    
    const skip = (page - 1) * limit;
    
    let sortOptions = {};
    let filterCondition = {};

    if (filter === 'trending') {
      sortOptions = { 'votes.score': -1, createdAt: -1 };
      filterCondition = { 'votes.upvotes.length': { $gt: 5 } }; // Filter for likes > 5
    } else {
      // 'latest' is default
      sortOptions = { createdAt: -1 };
    }
    
    // Apply both filter condition and sort options to the find query
    const posts = await Post.find(filterCondition)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Post.countDocuments(filterCondition);
    
    // For each post, get the comment count
    const postsWithCommentCounts = await Promise.all(posts.map(async post => {
      // Count comments for this post
      const commentsCount = await Comment.countDocuments({ postId: post._id });
      
      return {
        id: post._id,
        content: post.body,
        category: post.category,
        authorEmail: post.authorEmail,
        createdAt: post.createdAt,
        newUsername: post.authorUsername, // Use stored username
        likes: post.votes.upvotes.length,
        score: post.votes.score,
        userVote: req.user?.email ? (
          post.votes.upvotes.includes(req.user.email) ? 'like' : 'none'
        ) : null,
        commentsCount
      };
    }));

    res.status(200).json({
      posts: postsWithCommentCounts,
      hasMore: skip + posts.length < total,
      total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;
    
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Transform post to include vote information
    const postWithVotes = {
      ...post.toObject(),
      newUsername: post.authorUsername, // Use stored username
      votes: {
        score: post.votes.score,
        userVote: userEmail ? (
          post.votes.upvotes.includes(userEmail) ? 'like' : 'none'
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
    const {body, category } = req.body;
    const userEmail = req.user.email;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorEmail !== userEmail) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

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
