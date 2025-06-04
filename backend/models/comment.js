import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    authorEmail: {
        type: String,
        required: true
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null // null for top-level comments
    },
    votes: {
        upvotes: [{ type: String }], // Array of user emails who upvoted
        downvotes: [{ type: String }], // Array of user emails who downvoted
        score: { type: Number, default: 0 } // Computed score (upvotes - downvotes)
    }
}, {
    timestamps: true
});

// Add method to handle voting (similar to post voting)
commentSchema.methods.vote = async function(userEmail, voteType) {
    const upvoteIndex = this.votes.upvotes.indexOf(userEmail);
    const downvoteIndex = this.votes.downvotes.indexOf(userEmail);
    
    // Remove existing vote if any
    if (upvoteIndex > -1) {
        this.votes.upvotes.splice(upvoteIndex, 1);
        this.votes.score -= 1;
    }
    if (downvoteIndex > -1) {
        this.votes.downvotes.splice(downvoteIndex, 1);
        this.votes.score += 1;
    }
    
    // Add new vote
    if (voteType === 'upvote' && upvoteIndex === -1) {
        this.votes.upvotes.push(userEmail);
        this.votes.score += 1;
    } else if (voteType === 'downvote' && downvoteIndex === -1) {
        this.votes.downvotes.push(userEmail);
        this.votes.score -= 1;
    }
    
    return this.save();
};

// Add index for faster queries
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1, createdAt: -1 });

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment; 