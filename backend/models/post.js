import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    category: { type: String, required: true },
    authorEmail: { type: String, required: true }, // <- replaces anonId
    votes: {
        upvotes: [{ type: String }], // Array of user emails who upvoted
        downvotes: [{ type: String }], // Array of user emails who downvoted
        score: { type: Number, default: 0 } // Computed score (upvotes - downvotes)
    }
}, {
    timestamps: true
});

// Add method to handle voting
postSchema.methods.vote = async function(userEmail, voteType) {
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

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;