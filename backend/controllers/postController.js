import Post from '../models/Post.js';

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