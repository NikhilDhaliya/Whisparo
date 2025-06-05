import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    body: { type: String, required: true },
    category: { type: String, required: true },
    authorEmail: { type: String, required: true }, // <- replaces anonId
    authorUsername: { type: String, required: true }, // Store username at creation time
    image: {
        url: { type: String },
        public_id: { type: String }
    },
    votes: {
        upvotes: [{ type: String }], // Array of user emails who liked
        score: { type: Number, default: 0 } // Total likes count
    }
}, {
    timestamps: true
});

// Add method to handle voting
postSchema.methods.vote = async function(userEmail) {
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

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;