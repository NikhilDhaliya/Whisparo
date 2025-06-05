import Post from '../models/post.js';
import User from '../models/user.js'; // Assuming you have a User model

// Controller to handle voting on a post (like)
const votePost = async (req, res) => {
  const { id } = req.params; // Post ID
  const userEmail = req.user.email; // Authenticated user email from authMiddleware

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has already liked the post
    const hasLiked = post.votes.upvotes.includes(userEmail);

    if (hasLiked) {
      // Remove like if already liked
      await Post.findByIdAndUpdate(id, {
        $pull: { 'votes.upvotes': userEmail },
        $inc: { 'votes.score': -1 }
      });
    } else {
      // Add like if not liked
      await Post.findByIdAndUpdate(id, {
        $addToSet: { 'votes.upvotes': userEmail },
        $inc: { 'votes.score': 1 }
      });
    }

    // Get updated post
    const updatedPost = await Post.findById(id);
    
    // Determine the user's new vote status
    const userVoteStatus = updatedPost.votes.upvotes.includes(userEmail) ? 'like' : 'none';

    res.status(200).json({
      likes: updatedPost.votes.upvotes.length,
      score: updatedPost.votes.score,
      voteType: userVoteStatus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process vote' });
  }
};

// Controller to get user's vote status for a specific post
const getVoteStatus = async (req, res) => {
    const { id } = req.params; // Post ID
    const userEmail = req.user.email; // Authenticated user email from authMiddleware

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Determine the user's vote status from the post document
        const userVoteStatus = post.votes.upvotes.includes(userEmail) ? 'like' : 'none';

        res.status(200).json({ voteType: userVoteStatus });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vote status' });
    }
};

export { votePost, getVoteStatus }; 