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
        upvotes: [{ type: String }], // Array of user emails who liked
        score: { type: Number, default: 0 } // Total likes count
    }
}, {
    timestamps: true
});

// Add method to handle voting
commentSchema.methods.vote = async function(userEmail) {
    const upvoteIndex = this.votes.upvotes.indexOf(userEmail);
    
    // Toggle vote
    if (upvoteIndex > -1) {
        // Remove like if already liked
        this.votes.upvotes.splice(upvoteIndex, 1);
        this.votes.score -= 1;
    } else {
        // Add like if not liked
        this.votes.upvotes.push(userEmail);
        this.votes.score += 1;
    }
    
    return this.save();
};

// Add index for faster queries
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1, createdAt: -1 });

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment; 