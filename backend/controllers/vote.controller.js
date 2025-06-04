import Post from '../models/post.js';

export const votePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { voteType } = req.body;
        const userEmail = req.user.email; // From auth middleware

        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({ message: 'Invalid vote type' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Prevent voting on own posts
        if (post.authorEmail === userEmail) {
            return res.status(403).json({ message: 'Cannot vote on your own post' });
        }

        await post.vote(userEmail, voteType);

        res.json({
            message: 'Vote recorded successfully',
            post: {
                id: post._id,
                score: post.votes.score,
                userVote: post.votes.upvotes.includes(userEmail) ? 'upvote' : 
                         post.votes.downvotes.includes(userEmail) ? 'downvote' : null
            }
        });
    } catch (error) {
        console.error('Error voting on post:', error);
        res.status(500).json({ message: 'Error processing vote' });
    }
};

export const getVoteStatus = async (req, res) => {
    try {
        const { postId } = req.params;
        const userEmail = req.user.email;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({
            score: post.votes.score,
            userVote: post.votes.upvotes.includes(userEmail) ? 'upvote' : 
                     post.votes.downvotes.includes(userEmail) ? 'downvote' : null
        });
    } catch (error) {
        console.error('Error getting vote status:', error);
        res.status(500).json({ message: 'Error fetching vote status' });
    }
}; 