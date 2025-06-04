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

        // Get all comments for the post
        const comments = await Comment.find({ postId })
            .sort({ createdAt: -1 });

        // Transform comments to include vote information
        const commentsWithVotes = comments.map(comment => ({
            ...comment.toObject(),
            votes: {
                score: comment.votes.score,
                userVote: userEmail ? (
                    comment.votes.upvotes.includes(userEmail) ? 'upvote' : 
                    comment.votes.downvotes.includes(userEmail) ? 'downvote' : null
                ) : null
            }
        }));

        // Organize comments into a tree structure
        const commentTree = commentsWithVotes.reduce((tree, comment) => {
            if (!comment.parentCommentId) {
                // Top-level comment
                tree.push({
                    ...comment,
                    replies: []
                });
            } else {
                // Find parent comment and add as reply
                const parent = findCommentInTree(tree, comment.parentCommentId);
                if (parent) {
                    parent.replies.push(comment);
                }
            }
            return tree;
        }, []);

        res.json(commentTree);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
};

// Vote on a comment
export const voteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { voteType } = req.body;
        const userEmail = req.user.email;

        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({ message: 'Invalid vote type' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Prevent voting on own comments
        if (comment.authorEmail === userEmail) {
            return res.status(403).json({ message: 'Cannot vote on your own comment' });
        }

        await comment.vote(userEmail, voteType);

        res.json({
            message: 'Vote recorded successfully',
            comment: {
                id: comment._id,
                score: comment.votes.score,
                userVote: comment.votes.upvotes.includes(userEmail) ? 'upvote' : 
                         comment.votes.downvotes.includes(userEmail) ? 'downvote' : null
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

// Helper function to find a comment in the tree structure
function findCommentInTree(tree, commentId) {
    for (const comment of tree) {
        if (comment._id.toString() === commentId.toString()) {
            return comment;
        }
        if (comment.replies) {
            const found = findCommentInTree(comment.replies, commentId);
            if (found) return found;
        }
    }
    return null;
} 