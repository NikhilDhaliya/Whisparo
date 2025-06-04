import Post from '../models/post.js';
import User from '../models/user.js'; // Assuming you have a User model

// Controller to handle voting on a post (like/dislike)
const votePost = async (req, res) => {
  // Log incoming request
  console.log(`[Vote Controller] votePost: Incoming ${req.method} request to ${req.originalUrl}`);
  console.log('Request body:', req.body);
  console.log('Request params:', req.params);
  console.log('Authenticated user:', req.user);

  const { id } = req.params; // Post ID
  const { voteType } = req.body; // 'like' or 'dislike'
  const userEmail = req.user.email; // Authenticated user email from authMiddleware

  // Map frontend vote types to backend vote types
  const backendVoteType = voteType === 'like' ? 'upvote' : 'downvote';

  if (!['upvote', 'downvote'].includes(backendVoteType)) {
    return res.status(400).json({ message: 'Invalid vote type' });
  }

  try {
    // Atomic update logic
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // 1. Remove user from both upvotes and downvotes
    await Post.findByIdAndUpdate(id, {
      $pull: { 'votes.upvotes': userEmail, 'votes.downvotes': userEmail }
    });

    // 2. Add to the correct array and update score
    let update = {};
    if (backendVoteType === 'upvote') {
      update = {
        $addToSet: { 'votes.upvotes': userEmail }
      };
    } else if (backendVoteType === 'downvote') {
      update = {
        $addToSet: { 'votes.downvotes': userEmail }
      };
    } else {
      update = {};
    }

    await Post.findByIdAndUpdate(id, update);

    // Recalculate score
    const updatedPost = await Post.findById(id);
    const newScore = updatedPost.votes.upvotes.length - updatedPost.votes.downvotes.length;
    updatedPost.votes.score = newScore;
    await updatedPost.save();

    // Determine the user's new vote status after update
    const userVoteStatus = updatedPost.votes.upvotes.includes(userEmail) ? 'like' :
                           updatedPost.votes.downvotes.includes(userEmail) ? 'dislike' :
                           'none';

    res.status(200).json({
      likes: updatedPost.votes.upvotes.length,
      dislikes: updatedPost.votes.downvotes.length,
      score: updatedPost.votes.score,
      voteType: userVoteStatus,
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    res.status(500).json({ message: 'Failed to process vote' });
  }
};

// Controller to get user's vote status for a specific post
const getVoteStatus = async (req, res) => {
    // Log incoming request
    console.log(`[Vote Controller] getVoteStatus: Incoming ${req.method} request to ${req.originalUrl}`);
    console.log('Request params:', req.params);
    console.log('Authenticated user:', req.user);

    const { id } = req.params; // Post ID
    const userEmail = req.user.email; // Authenticated user email from authMiddleware

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Determine the user's vote status from the post document
        const userVoteStatus = post.votes.upvotes.includes(userEmail) ? 'like' :
                               post.votes.downvotes.includes(userEmail) ? 'dislike' :
                               'none';

        res.status(200).json({ voteType: userVoteStatus });

    } catch (error) {
        console.error('Error fetching vote status:', error);
        res.status(500).json({ message: 'Failed to fetch vote status' });
    }
};

export { votePost, getVoteStatus }; 