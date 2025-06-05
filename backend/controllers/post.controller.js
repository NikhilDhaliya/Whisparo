import Post from "../models/post.js";
import Comment from "../models/comment.js";
import { cloudinary } from "../config/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { body, category } = req.body;
    const authorEmail = req.user.email;
    
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

    const postData = {
      body,
      category,
      authorEmail,
      authorUsername: username
    };

    // Add image data if an image was uploaded
    if (req.file) {
      console.log('File uploaded:', req.file);
      postData.image = {
        url: req.file.path,
        public_id: req.file.filename
      };
    }

    console.log('Creating post with data:', postData);
    const newPost = await Post.create(postData);

    // Transform the response to match frontend expectations
    const responsePost = {
      id: newPost._id,
      content: newPost.body,
      category: newPost.category,
      authorEmail: newPost.authorEmail,
      createdAt: newPost.createdAt,
      newUsername: newPost.authorUsername,
      likes: newPost.votes.upvotes.length,
      image: newPost.image
    };

    res.status(201).json({
      message: "Post created successfully",
      post: responsePost
    });
  } catch (error) {
    console.error('Error creating post:', {
      message: error.message,
      stack: error.stack,
      details: error
    });
    
    // Send a more detailed error response
    res.status(500).json({ 
      message: "Error creating post",
      error: error.message,
      details: error.stack
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || 'latest';
    const authorEmail = req.query.authorEmail;
    
    const skip = (page - 1) * limit;
    
    let sortOptions = {};
    let filterCondition = {};

    if (authorEmail) {
      filterCondition.authorEmail = authorEmail;
    }

    if (filter === 'trending') {
      sortOptions = { 'votes.score': -1, createdAt: -1 };
      filterCondition['votes.upvotes.length'] = { $gt: 5 };
    } else {
      sortOptions = { createdAt: -1 };
    }
    
    const posts = await Post.find(filterCondition)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments(filterCondition);
    
    const postsWithCommentCounts = await Promise.all(posts.map(async post => {
      const commentsCount = await Comment.countDocuments({ postId: post._id });
      
      return {
        id: post._id,
        content: post.body,
        category: post.category,
        authorEmail: post.authorEmail,
        createdAt: post.createdAt,
        newUsername: post.authorUsername,
        likes: post.votes.upvotes.length,
        score: post.votes.score,
        image: post.image,
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

    // Get current username from cookie
    const usernameCookie = req.cookies.username;
    let currentUsername = 'Anonymous';
    if (usernameCookie) {
      try {
        const parsed = JSON.parse(usernameCookie);
        const age = Date.now() - parsed.timestamp;
        if (age < 30 * 60 * 1000) {
          currentUsername = parsed.username;
        }
      } catch (e) {
        console.error('Error parsing username cookie:', e);
      }
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorEmail !== userEmail) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    post.body = body || post.body;
    post.category = category || post.category;
    post.authorUsername = currentUsername; // Update the username

    await post.save();

    // Transform the response to match frontend expectations
    const responsePost = {
      id: post._id,
      content: post.body,
      category: post.category,
      authorEmail: post.authorEmail,
      createdAt: post.createdAt,
      newUsername: post.authorUsername,
      likes: post.votes.upvotes.length,
      image: post.image
    };

    res.status(200).json({ message: "Post updated", post: responsePost });
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

    // Delete image from Cloudinary if it exists
    if (post.image && post.image.public_id) {
      await cloudinary.uploader.destroy(post.image.public_id);
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ postId: id });

    // Delete the post
    await Post.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Post and associated comments deleted successfully" });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const trendingPosts = await Post.find({ 'votes.score': { $gt: 5 } })
      .sort({ 'votes.score': -1, createdAt: -1 })
      .lean();

    // Transform the data to match the frontend expectations
    const formattedPosts = trendingPosts.map(post => ({
      id: post._id,
      content: post.body,
      category: post.category,
      createdAt: post.createdAt,
      likes: post.votes.score || 0,
      authorEmail: post.authorEmail,
      newUsername: post.authorUsername || 'Anonymous',
      commentsCount: 0 // We'll add this if needed
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ 
      message: 'Error fetching trending posts',
      error: error.message 
    });
  }
};
