import Comment from '../models/comment.js';
import Post from '../models/post.js';

// Create a new comment
export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { body, parentCommentId } = req.body;
        const authorEmail = req.user.email;

        // Validate post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // If this is a reply, validate parent comment exists
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
            // Ensure parent comment belongs to the same post
            if (parentComment.postId.toString() !== postId) {
                return res.status(400).json({ message: 'Parent comment does not belong to this post' });
            }
        }

        const comment = await Comment.create({
            postId,
            body,
            authorEmail,
            parentCommentId: parentCommentId || null
        });

        res.status(201).json({
            message: 'Comment created successfully',
            comment: {
                ...comment.toObject(),
                votes: {
                    score: comment.votes.score,
                    userVote: null // New comment, no votes yet
                }
            }
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment' });
    }
};

// Get comments for a post
export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const userEmail = req.user?.email;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; // Default to 5 comments per page
        const skip = (page - 1) * limit;

        // Get top-level comments for the post with pagination
        const topLevelComments = await Comment.find({ postId, parentCommentId: null })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get the total count of top-level comments for pagination info
        const totalTopLevelComments = await Comment.countDocuments({ postId, parentCommentId: null });

        // For each top-level comment, fetch its replies. 
        // Note: This approach fetches all replies for the displayed top-level comments.
        // For very deep/wide reply trees, a more complex paginated reply fetching might be needed,
        // but for now, fetching all replies for displayed top-level comments is simpler.
        const commentsWithReplies = await Promise.all(topLevelComments.map(async comment => {
            const replies = await Comment.find({ parentCommentId: comment._id }).sort({ createdAt: 1 });
            return { ...comment.toObject(), replies };
        }));

        // Transform comments and replies to include vote information
        const transformedComments = commentsWithReplies.map(comment => ({
            ...comment,
            votes: {
                score: comment.votes.score,
                userVote: userEmail ? (
                    comment.votes.upvotes.includes(userEmail) ? 'like' : 'none'
                ) : null
            },
            replies: comment.replies.map(reply => ({
                ...reply.toObject(),
                votes: {
                    score: reply.votes.score,
                    userVote: userEmail ? (
                        reply.votes.upvotes.includes(userEmail) ? 'like' : 'none'
                    ) : null
                }
            }))
        }));

        res.json({
            comments: transformedComments,
            currentPage: page,
            totalPages: Math.ceil(totalTopLevelComments / limit),
            totalComments: totalTopLevelComments,
            hasMore: skip + topLevelComments.length < totalTopLevelComments,
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
};

// Vote on a comment
export const voteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userEmail = req.user.email;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Prevent voting on own comments
        if (comment.authorEmail === userEmail) {
            return res.status(403).json({ message: 'Cannot vote on your own comment' });
        }

        await comment.vote(userEmail);

        res.json({
            message: 'Vote recorded successfully',
            comment: {
                id: comment._id,
                score: comment.votes.score,
                userVote: comment.votes.upvotes.includes(userEmail) ? 'like' : 'none'
            }
        });
    } catch (error) {
        console.error('Error voting on comment:', error);
        res.status(500).json({ message: 'Error processing vote' });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userEmail = req.user.email;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Only allow author to delete
        if (comment.authorEmail !== userEmail) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Delete the comment and all its replies
        await Comment.deleteMany({
            $or: [
                { _id: commentId },
                { parentCommentId: commentId }
            ]
        });

        res.json({ message: 'Comment and its replies deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
};

// Get comments by user ID
export const getCommentsByUser = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get all comments by the user
        const comments = await Comment.find({ authorEmail: userEmail })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Comment.countDocuments({ authorEmail: userEmail });

        // Get post details for each comment
        const commentsWithPostDetails = await Promise.all(comments.map(async comment => {
            const post = await Post.findById(comment.postId);
            return {
                ...comment.toObject(),
                postTitle: post ? post.body.substring(0, 100) + '...' : 'Post not found',
                postId: post ? post._id : null
            };
        }));

        res.json({
            comments: commentsWithPostDetails,
            hasMore: skip + comments.length < total,
            total
        });
    } catch (error) {
        console.error('Error fetching user comments:', error);
        res.status(500).json({ message: 'Error fetching user comments' });
    }
}; 